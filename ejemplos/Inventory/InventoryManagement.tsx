'use client'

import React, { useState, useEffect } from 'react'

interface Product {
  id: number
  name: string
  price: number
  stock: number
}

// Simulated API calls
const api = {
  fetchProducts: (): Promise<Product[]> => 
    Promise.resolve([
      { id: 1, name: "Laptop", price: 999.99, stock: 50 },
      { id: 2, name: "Smartphone", price: 499.99, stock: 100 },
      { id: 3, name: "Headphones", price: 99.99, stock: 200 },
    ]),
  addProduct: (product: Omit<Product, 'id'>): Promise<Product> => 
    Promise.resolve({ ...product, id: Date.now() }),
  updateStock: (id: number, newStock: number): Promise<void> => 
    Promise.resolve(),
}

// Model
function useInventoryModel() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await api.fetchProducts()
      setProducts(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch products')
      setLoading(false)
    }
  }

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await api.addProduct(product)
      setProducts([...products, newProduct])
    } catch (err) {
      setError('Failed to add product')
    }
  }

  const updateStock = async (id: number, newStock: number) => {
    try {
      await api.updateStock(id, newStock)
      setProducts(products.map(p => 
        p.id === id ? { ...p, stock: newStock } : p
      ))
    } catch (err) {
      setError('Failed to update stock')
    }
  }

  return { products, loading, error, fetchProducts, addProduct, updateStock }
}

// View
function InventoryView({ 
  products, 
  loading, 
  error, 
  onAddProduct, 
  onUpdateStock 
}: {
  products: Product[]
  loading: boolean
  error: string | null
  onAddProduct: (product: Omit<Product, 'id'>) => void
  onUpdateStock: (id: number, newStock: number) => void
}) {
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ name: '', price: 0, stock: 0 })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddProduct(newProduct)
    setNewProduct({ name: '', price: 0, stock: 0 })
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Inventory Management</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newProduct.name}
          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
          placeholder="Product Name"
          className="border p-2 mr-2"
        />
        <input
          type="number"
          value={newProduct.price}
          onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
          placeholder="Price"
          className="border p-2 mr-2"
        />
        <input
          type="number"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
          placeholder="Stock"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Product</button>
      </form>

      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>{product.stock}</td>
              <td>
                <button 
                  onClick={() => onUpdateStock(product.id, product.stock + 1)}
                  className="bg-green-500 text-white p-1 rounded mr-2"
                >
                  +
                </button>
                <button 
                  onClick={() => onUpdateStock(product.id, Math.max(0, product.stock - 1))}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  -
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Controller
export default function InventoryController() {
  const { products, loading, error, fetchProducts, addProduct, updateStock } = useInventoryModel()

  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <InventoryView
      products={products}
      loading={loading}
      error={error}
      onAddProduct={addProduct}
      onUpdateStock={updateStock}
    />
  )
}
