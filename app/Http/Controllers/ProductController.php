<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::orderBy('product_name', 'asc')->get();
        return response()->json([
            'data' => $products
        ]);
    }

    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json([
            'data' => $product
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'category' => 'nullable|string|max:255'
        ]);

        $product = Product::create([
            'product_name' => $validated['product_name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'quantity' => $validated['quantity'],
            'category' => $validated['category'] ?? null
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'category' => 'nullable|string|max:255'
        ]);

        $product->update([
            'product_name' => $validated['product_name'],
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'quantity' => $validated['quantity'],
            'category' => $validated['category'] ?? null
        ]);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        
        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }
}
