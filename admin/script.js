class AdminApp {
    constructor() {
        this.products = [];
        this.currentEditingId = null;
        this.API_BASE = 'http://localhost:3000/api';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProducts();
    }

    bindEvents() {
        // 添加商品按钮
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showModal();
        });

        // 刷新按钮
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadProducts();
        });

        // 搜索功能
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchProducts();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchProducts();
            }
        });

        // 模态框事件
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal();
        });

        // 点击模态框外部关闭
        document.getElementById('productModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('productModal')) {
                this.hideModal();
            }
        });

        // 表单提交
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    }

    async loadProducts() {
        try {
            this.showLoading();
            const response = await fetch(`${this.API_BASE}/products`);
            const data = await response.json();
            
            if (response.ok) {
                this.products = data.products || [];
                this.renderProducts();
                this.updateStats();
            } else {
                throw new Error(data.error || '获取商品列表失败');
            }
        } catch (error) {
            console.error('加载商品失败:', error);
            this.showError('加载商品列表失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        
        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <h3>暂无商品</h3>
                        <p>点击"添加新盲盒"按钮添加第一个商品</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>
                    ${product.image_url ? 
                        `<img src="${product.image_url}" alt="${product.name}" class="product-image">` : 
                        `<div class="product-image-placeholder">无图片</div>`
                    }
                </td>
                <td>
                    <div>
                        <strong>${product.name}</strong>
                        <div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">
                            ${product.description || '无描述'}
                        </div>
                    </div>
                </td>
                <td class="price">¥${product.price}</td>
                <td class="stock ${product.stock <= 0 ? 'zero' : product.stock <= 5 ? 'low' : ''}">${product.stock}</td>
                <td>
                    <span class="status-badge ${product.stock > 0 ? 'status-active' : 'status-out-of-stock'}">
                        ${product.stock > 0 ? '在售' : '缺货'}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn btn-secondary" onclick="adminApp.editProduct(${product.id})">编辑</button>
                    <button class="btn btn-warning" onclick="adminApp.toggleStock(${product.id})">
                        ${product.stock > 0 ? '下架' : '上架'}
                    </button>
                    <button class="btn btn-danger" onclick="adminApp.deleteProduct(${product.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const total = this.products.length;
        const active = this.products.filter(p => p.stock > 0).length;
        const outOfStock = this.products.filter(p => p.stock === 0).length;

        document.getElementById('totalProducts').textContent = total;
        document.getElementById('activeProducts').textContent = active;
        document.getElementById('outOfStockProducts').textContent = outOfStock;
    }

    searchProducts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        if (!searchTerm) {
            this.renderProducts();
            return;
        }

        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm)
        );

        const tbody = document.getElementById('productsTableBody');
        
        if (filteredProducts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <h3>没有找到匹配的商品</h3>
                        <p>请尝试其他关键词</p>
                    </td>
                </tr>
            `;
            return;
        }

        // 临时保存当前产品列表，渲染搜索结果
        const originalProducts = this.products;
        this.products = filteredProducts;
        this.renderProducts();
        this.products = originalProducts;
    }

    showModal(title = '添加新盲盒') {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('productModal').style.display = 'block';
        document.getElementById('productForm').reset();
        this.currentEditingId = null;
    }

    hideModal() {
        document.getElementById('productModal').style.display = 'none';
        this.currentEditingId = null;
    }

    async editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        this.currentEditingId = id;
        this.showModal('编辑商品');

        // 填充表单
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productImage').value = product.image_url || '';
    }

    async saveProduct() {
        try {
            this.showLoading();

            const formData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('productStock').value),
                image_url: document.getElementById('productImage').value
            };

            const url = this.currentEditingId ? 
                `${this.API_BASE}/products/${this.currentEditingId}` : 
                `${this.API_BASE}/products`;
            
            const method = this.currentEditingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                this.hideModal();
                this.loadProducts();
                this.showSuccess(this.currentEditingId ? '商品更新成功' : '商品添加成功');
            } else {
                throw new Error(data.error || '保存失败');
            }
        } catch (error) {
            console.error('保存商品失败:', error);
            this.showError('保存失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async toggleStock(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        const action = product.stock > 0 ? '下架' : '上架';
        
        if (!confirm(`确定要${action}商品"${product.name}"吗？`)) {
            return;
        }

        try {
            this.showLoading();

            const newStock = product.stock > 0 ? 0 : 10; // 下架设为0，上架设为10

            const response = await fetch(`${this.API_BASE}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...product,
                    stock: newStock
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.loadProducts();
                this.showSuccess(`商品${action}成功`);
            } else {
                throw new Error(data.error || `${action}失败`);
            }
        } catch (error) {
            console.error(`${action}商品失败:`, error);
            this.showError(`${action}失败: ` + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async deleteProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;

        if (!confirm(`确定要删除商品"${product.name}"吗？此操作不可撤销。`)) {
            return;
        }

        try {
            this.showLoading();

            const response = await fetch(`${this.API_BASE}/products/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                this.loadProducts();
                this.showSuccess('商品删除成功');
            } else {
                throw new Error(data.error || '删除失败');
            }
        } catch (error) {
            console.error('删除商品失败:', error);
            this.showError('删除失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showSuccess(message) {
        alert('✅ ' + message);
    }

    showError(message) {
        alert('❌ ' + message);
    }
}

// 初始化应用
const adminApp = new AdminApp();
