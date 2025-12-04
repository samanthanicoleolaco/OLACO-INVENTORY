import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

function ProductInventory() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_name: "",
        description: "",
        price: "",
        quantity: "",
        category: "",
    });
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [categories, setCategories] = useState([]);

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchTerm, categoryFilter, products]);

    const fetchProducts = async (shouldLoad = true) => {
        if (shouldLoad) setLoading(true);
        try {
            const response = await fetch("/api/products");
            const data = await response.json();
            const productList = data.data || [];
            setProducts(productList);
            setFilteredProducts(productList);
            extractCategories(productList);
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
            setFilteredProducts([]);
        }
        if (shouldLoad) setLoading(false);
    };

    const extractCategories = (products) => {
        const uniqueCategories = [
            ...new Set(
                products
                    .map((p) => p.category)
                    .filter((c) => c !== null && c !== "")
            ),
        ];
        setCategories(uniqueCategories);
    };

    const filterProducts = () => {
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

        setFilteredProducts(filtered);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const action = editId ? "update" : "add";
        if (!confirm(`Are you sure you want to ${action} this product?`))
            return;

        try {
            if (editId) {
                await fetch(`/api/products/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                alert("Product updated successfully!");
            } else {
                await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                alert("Product added successfully!");
            }

            setFormData({
                product_name: "",
                description: "",
                price: "",
                quantity: "",
                category: "",
            });
            setEditId(null);
            fetchProducts(false);
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        setLoading(true);
        try {
            await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });
            alert("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
        setLoading(false);
    };

    const handleEdit = (product) => {
        setFormData({
            product_name: product.product_name,
            description: product.description || "",
            price: product.price,
            quantity: product.quantity,
            category: product.category || "",
        });
        setEditId(product.id);
    };

    const handleCancel = () => {
        setFormData({
            product_name: "",
            description: "",
            price: "",
            quantity: "",
            category: "",
        });
        setEditId(null);
    };

    return (
        <div className="product-inventory">
            <div className="container">
                <div className="inventory-header">
                    <h1>Product Inventory</h1>
                </div>

                <div className="content-wrapper">
                    <div className="form-section">
                        <h3>{editId ? "Edit Product" : "Add New Product"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name</label>
                                <input
                                    type="text"
                                    name="product_name"
                                    placeholder="Product Name"
                                    value={formData.product_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    type="text"
                                    name="category"
                                    placeholder="Category"
                                    value={formData.category}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Price (₱)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    placeholder="Price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="Quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                {editId && (
                                    <button
                                        type="button"
                                        className="btn btn-cancel"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-submit"
                                    disabled={loading}
                                >
                                    {editId ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="table-section">
                        <div className="filter-section">
                            <div className="search-wrapper">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <div className="category-wrapper">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) =>
                                        setCategoryFilter(e.target.value)
                                    }
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
                        {loading && <p>Loading...</p>}
                        {products.length === 0 && !loading && (
                            <p>
                                No products available. Add your first product
                                above.
                            </p>
                        )}
                        {products.length > 0 && (
                            <div className="table-wrapper">
                                {filteredProducts.length === 0 ? (
                                    <div className="no-data">
                                        No products found
                                    </div>
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
                                                    <td>
                                                        {product.product_name}
                                                    </td>
                                                    <td>
                                                        {product.category ||
                                                            "-"}
                                                    </td>
                                                    <td>
                                                        ₱
                                                        {formatPrice(
                                                            product.price
                                                        )}
                                                    </td>
                                                    <td>{product.quantity}</td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-edit"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        product
                                                                    )
                                                                }
                                                                disabled={
                                                                    loading
                                                                }
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        product.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    loading
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
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductInventory;

if (document.getElementById("samantha")) {
    ReactDOM.render(<ProductInventory />, document.getElementById("samantha"));
}
