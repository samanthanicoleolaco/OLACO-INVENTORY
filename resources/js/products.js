import React, { Component } from "react";
import axios from "axios";

class ProductInventory extends Component {
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            filteredProducts: [],
            searchTerm: "",
            categoryFilter: "",
            categories: [],
            editingId: null,
            formData: {
                product_name: "",
                description: "",
                price: "",
                quantity: "",
                category: "",
            },
            errors: {},
        };
    }

    componentDidMount() {
        this.fetchProducts();
    }

    fetchProducts = async () => {
        try {
            const response = await axios.get("/api/products");
            const products = response.data;
            this.setState({
                products,
                filteredProducts: products,
            });
            this.extractCategories(products);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    extractCategories = (products) => {
        const uniqueCategories = [
            ...new Set(
                products
                    .map((p) => p.category)
                    .filter((c) => c !== null && c !== "")
            ),
        ];
        this.setState({ categories: uniqueCategories });
    };

    handleSearch = (e) => {
        const searchTerm = e.target.value;
        this.setState({ searchTerm }, this.filterProducts);
    };

    handleCategoryFilter = (e) => {
        const categoryFilter = e.target.value;
        this.setState({ categoryFilter }, this.filterProducts);
    };

    filterProducts = () => {
        const { products, searchTerm, categoryFilter } = this.state;
        let filtered = products;

        if (searchTerm) {
            filtered = filtered.filter((product) =>
                product.product_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(
                (product) => product.category === categoryFilter
            );
        }

        this.setState({ filteredProducts: filtered });
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            formData: {
                ...this.state.formData,
                [name]: value,
            },
        });
    };

    handleEdit = (product) => {
        this.setState({
            editingId: product.id,
            formData: {
                product_name: product.product_name,
                description: product.description || "",
                price: product.price,
                quantity: product.quantity,
                category: product.category || "",
            },
            errors: {},
        });
    };

    handleCancel = () => {
        this.setState({
            editingId: null,
            formData: {
                product_name: "",
                description: "",
                price: "",
                quantity: "",
                category: "",
            },
            errors: {},
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { editingId, formData } = this.state;

        try {
            if (editingId) {
                await axios.put(`/api/products/${editingId}`, formData);
            } else {
                await axios.post("/api/products", formData);
            }

            this.handleCancel();
            this.fetchProducts();
        } catch (error) {
            if (error.response && error.response.data.errors) {
                this.setState({ errors: error.response.data.errors });
            }
            console.error("Error saving product:", error);
        }
    };

    handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`/api/products/${id}`);
                this.fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    formatPrice = (price) => {
        return (
            "₱" +
            parseFloat(price).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
        );
    };

    render() {
        const {
            filteredProducts,
            searchTerm,
            categoryFilter,
            categories,
            editingId,
            formData,
            errors,
        } = this.state;

        return (
            <div className="product-inventory">
                <div className="container">
                    {/* Header */}
                    <div className="inventory-header">
                        <h1>Product Inventory</h1>
                    </div>

                    <div className="content-wrapper">
                        {/* Left Side - Add Product Form */}
                        <div className="form-section">
                            <h3>
                                {editingId
                                    ? "Edit Product"
                                    : "Add New Product"}
                            </h3>
                            <form onSubmit={this.handleSubmit}>
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        name="product_name"
                                        value={formData.product_name}
                                        onChange={this.handleInputChange}
                                        required
                                    />
                                    {errors.product_name && (
                                        <div className="error-message">
                                            {errors.product_name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Price (₱)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="price"
                                        value={formData.price}
                                        onChange={this.handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={this.handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    {editingId && (
                                        <button
                                            type="button"
                                            className="btn btn-cancel"
                                            onClick={this.handleCancel}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button type="submit" className="btn btn-submit">
                                        {editingId ? "Update Product" : "Add Product"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Right Side - Product List */}
                        <div className="table-section">
                            {/* Filters */}
                            <div className="filter-section">
                                <div className="search-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={this.handleSearch}
                                    />
                                </div>
                                <div className="category-wrapper">
                                    <select
                                        value={categoryFilter}
                                        onChange={this.handleCategoryFilter}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category, index) => (
                                            <option key={index} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <h3>Products ({filteredProducts.length})</h3>
                            <div className="table-wrapper">
                                {filteredProducts.length === 0 ? (
                                    <div className="no-data">No products found</div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product Name</th>
                                                <th>Category</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map((product) => (
                                                <tr key={product.id}>
                                                    <td>{product.product_name}</td>
                                                    <td>{product.category || "-"}</td>
                                                    <td>{this.formatPrice(product.price)}</td>
                                                    <td>{product.quantity}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-edit"
                                                                onClick={() =>
                                                                    this.handleEdit(product)
                                                                }
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() =>
                                                                    this.handleDelete(product.id)
                                                                }
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProductInventory;
