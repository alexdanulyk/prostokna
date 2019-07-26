$(document).on("click", ".productsMenu__brands__brand a", function () {
    $('.productsMenu__brands__brand').removeClass('active')
    $(this).parent().addClass('active')
    var index = $(this).parent().index()
    $('.productsMenu__products__list').removeClass('active')
    $('.productsMenu__products__list').eq(index).addClass('active')
    return false
})


$(document).on("click", ".brand_list_link", function () {
    $(this).parents('.list').find('.brand_list_item').removeClass('open')
    $(this).parents('.brand_list_item').addClass('open')
    return false
}).on("click", "#productMenu .list .item .title ul li", function () {
    $(this).addClass('active').siblings().removeClass('active')
    return false
}).on("click", "#productMenu .filter .category ul li a", function () {
    $(this).parent().addClass('active').siblings().removeClass('active')
    return false
})


if ($('#productMenu').length) {
    var productsMenu = new Vue({
        el: '#productMenu',
        data: {
            iProductID: 0,
            materials: [],
            brands: [],
            products: [],
        },
        created: function () {
            this.get()
        },
        mounted: function() {
            Vue.set(this, 'iProductID', Number(this.$el.getAttribute('data-iProductID')))
        },
        methods: {
            clickBrand: function (brandItem) {
                this.materials.forEach((material, key1) => {
                    material.brand.forEach((brand, key2) => {
                        var status = false
                        if (brandItem.iBrandID == brand.iBrandID && (brandItem.active == false || !brandItem.active)) {
                            status = true
                        }
                        Vue.set(this.materials[key1].brand[key2], 'active', status)
                    })
                })
            },
            get: function () {
                axios.get('/getProductMenu').then((response) => {
                    this.products = response.data.products
                    this.materials = response.data.materials
                    this.materials.forEach(material => {
                        if (material.material_categories[0]) {
                            Vue.set(material, 'iMaterialCategoryID_active', material.material_categories[0].iMaterialCategoryID)
                        } else {
                            Vue.set(material, 'iMaterialCategoryID_active', false)
                        }
                        Vue.set(material, 'brand', [])
                    })
                    this.products.forEach(product => {
                        var material = this.materials.find(x => x.iMaterialID === product.iMaterialID)
                        var materialKey = this.materials.findIndex(x => x.iMaterialID === product.iMaterialID)
                        var brand = material.brand.find(x => x.iBrandID === product.brand.iBrandID)
                        var brandKey = material.brand.findIndex(x => x.iBrandID === product.brand.iBrandID)
                        var product_item = {
                            iProductID: product.iProductID,
                            sProductTitle: product.sProductTitle,
                            sProductURI: product.sProductURI,
                            iGenerateUriMaterial: product.iGenerateUriMaterial,
                            iGenerateUriBrus: product.iGenerateUriBrus,
                            iMaterialID: product.iMaterialID,
                            iMaterialCategoryID: product.iMaterialCategoryID,
                            sMaterialTitle: (product.material) ? product.material.sMaterialTitle : false,
                            sBrusTitle: (product.bru) ? product.bru.sBrusTitle : false,
                        }
                        if (brand) {
                            this.materials[materialKey].brand[brandKey].models.push(product_item)
                        } else {
                            product.brand.models = []
                            product.brand.models.push(product_item)
                            this.materials[materialKey].brand.push(product.brand)
                        }
                    })

                    if (this.iProductID) {
                        console.log(this.iProductID)
                        this.materials.forEach(material => {
                            material.brand.forEach(brand => {
                                brand.models.forEach(model => {
                                    if (model.iProductID == this.iProductID) {
                                        Vue.set(brand, 'active', true)
                                        Vue.set(model, 'active', true)
                                        if (model.iMaterialCategoryID) {
                                            Vue.set(material, 'iMaterialCategoryID_active', model.iMaterialCategoryID)
                                        }
                                    }
                                })
                            })
                        })
                    }



                    // this.brands = response.data.brands
                    // 
                    // if (this.iProductID) {
                    //     var iMaterialID = this.products.find(x => x.iProductID === this.iProductID).iMaterialID
                    //     if (iMaterialID == 4 || iMaterialID == 5 || iMaterialID == 6) { // Колхоз. Если товар дерево, выделяем подкатегорию дерева
                    //         Vue.set(this.materialMenus[2], 'iMaterialID', iMaterialID)
                    //     }
                    // }
                    // this.setListInMaterial()
                    // if (this.iProductID) {
                    //     this.materialMenus.forEach((e1, k1) => {
                    //         e1.list.forEach((e2, k2) => {
                    //             e2.list.forEach((e3, k3) => {
                    //                 if (e3.iProductID == this.iProductID) {
                    //                     Vue.set(this.materialMenus[k1].list[k2], 'active', true)
                    //                     Vue.set(this.materialMenus[k1].list[k2].list[k3], 'active', true)
                    //                 }                            
                    //             })
                    //         })
                    //     })    
                    // }
                })
            },
            // setListInMaterial: function (k1 = false, k2 = false) {
            //     this.materialMenus.forEach((materialMenu, materialMenuKey)  => {
            //         Vue.set(this.materialMenus[materialMenuKey], 'list', [])

                    // this.products.forEach(product => {
                    //     if (product.iMaterialID == materialMenu.iMaterialID) {
                    //         var temp = this.materialMenus[materialMenuKey].list.find(x => x.iBrandID === product.iBrandID)
                    //         var product_item = {
                    //             iProductID: product.iProductID,
                    //             sProductTitle: product.sProductTitle,
                    //             sProductURI: product.sProductURI,
                    //             iGenerateUriMaterial: product.iGenerateUriMaterial,
                    //             iGenerateUriBrus: product.iGenerateUriBrus,
                    //             iMaterialID: product.iMaterialID,
                    //             sMaterialTitle: (product.material) ? product.material.sMaterialTitle : false,
                    //             sBrusTitle: (product.bru) ? product.bru.sBrusTitle : false,
                    //             active: false
                    //         }
                    //         if (!temp) {
                    //             this.materialMenus[materialMenuKey].list.push({
                    //                 iBrandID: product.iBrandID,
                    //                 sBrandTitle: product.brand.sBrandTitle,
                    //                 active: false,
                    //                 list: [product_item]
                    //             })
                    //         } else {
                    //             temp.list.push(product_item)
                    //         }
                    //     }
                    // })
            //     })
            //     if (k1 !== false && k2 !== false) {
            //         Vue.set(this.materialMenus[k1].list[k2], 'active', true)
            //     }
            // },
        }
    })
}
