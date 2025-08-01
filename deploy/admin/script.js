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
            console.log('点击添加商品按钮');
            this.currentEditingId = null; // 确保清空编辑状态
            this.showModal('添加新盲盒');
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
            console.log('正在加载商品列表...');
            
            const response = await fetch(`${this.API_BASE}/products?limit=1000`);
            console.log('API响应状态:', response.status);
            
            const data = await response.json();
            console.log('API响应数据:', data);
            
            if (response.ok) {
                this.products = data.products || [];
                console.log('成功加载商品:', this.products.length, '个');
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
        console.log('显示模态框:', title);
        console.log('当前编辑ID:', this.currentEditingId);
        
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('productModal').style.display = 'block';
        
        // 只有在添加新商品时才重置表单和编辑状态
        if (title === '添加新盲盒') {
            this.currentEditingId = null;
            document.getElementById('productForm').reset();
            console.log('添加模式 - 表单已重置，编辑ID已清空');
        } else {
            console.log('编辑模式 - 保持当前编辑ID:', this.currentEditingId);
        }
    }

    hideModal() {
        document.getElementById('productModal').style.display = 'none';
        document.getElementById('productForm').reset();
        this.currentEditingId = null;
        console.log('模态框已关闭，状态已清理');
    }

    async editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) {
            console.error('找不到商品 ID:', id);
            return;
        }

        console.log('编辑商品:', product);
        this.currentEditingId = id;
        this.showModal('编辑商品');

        // 确保在显示模态框后再填充表单
        setTimeout(() => {
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price || '';
            document.getElementById('productStock').value = product.stock || '';
            document.getElementById('productImage').value = product.image_url || '';
            
            console.log('表单已填充:', {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: document.getElementById('productPrice').value,
                stock: document.getElementById('productStock').value,
                image_url: document.getElementById('productImage').value
            });
        }, 100);
    }

    async saveProduct() {
        try {
            this.showLoading();
            
            // 验证表单数据
            const name = document.getElementById('productName').value.trim();
            const description = document.getElementById('productDescription').value.trim();
            const price = parseFloat(document.getElementById('productPrice').value);
            const stock = parseInt(document.getElementById('productStock').value);
            const image_url = document.getElementById('productImage').value.trim();
            
            // 基本验证
            if (!name) {
                throw new Error('商品名称不能为空');
            }
            if (isNaN(price) || price < 0) {
                throw new Error('价格必须是有效的数字');
            }
            if (isNaN(stock) || stock < 0) {
                throw new Error('库存必须是有效的数字');
            }
            
            const formData = {
                name,
                description,
                price,
                stock,
                image_url
            };
            
            console.log('提交商品数据:', formData);
            console.log('编辑模式:', this.currentEditingId ? '是' : '否');

            const url = this.currentEditingId ? 
                `${this.API_BASE}/products/${this.currentEditingId}` : 
                `${this.API_BASE}/products`;
            
            const method = this.currentEditingId ? 'PUT' : 'POST';
            
            console.log('请求URL:', url);
            console.log('请求方法:', method);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            console.log('保存响应状态:', response.status);
            console.log('保存响应状态文本:', response.statusText);
            
            let data;
            try {
                data = await response.json();
                console.log('保存响应数据:', data);
            } catch (parseError) {
                console.error('解析响应数据失败:', parseError);
                throw new Error(`服务器响应格式错误: ${response.status} ${response.statusText}`);
            }

            if (response.ok) {
                this.hideModal();
                await this.loadProducts(); // 确保等待数据加载完成
                this.showSuccess(this.currentEditingId ? '商品更新成功' : '商品添加成功');
            } else {
                // 获取详细的错误信息
                const errorText = await response.text();
                console.error('保存失败，响应内容:', errorText);
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
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
            
            console.log(`${action}商品 ID:${id}, 当前库存:${product.stock}, 新库存:${newStock}`);

            const response = await fetch(`${this.API_BASE}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: newStock,
                    image_url: product.image_url
                })
            });

            console.log('上架下架响应状态:', response.status);
            const data = await response.json();
            console.log('上架下架响应数据:', data);

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
            
            console.log('删除商品 ID:', id);

            const response = await fetch(`${this.API_BASE}/products/${id}`, {
                method: 'DELETE'
            });

            console.log('删除响应状态:', response.status);
            const data = await response.json();
            console.log('删除响应数据:', data);

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
