const express = require('express')

var auth = require('http-auth');
var basic = auth.basic({
    realm: "Admin",
    file: __dirname + "/.htpasswd"
});

const app = express()
const http = require('http').createServer(app)
const config = require('config')
const pug = require('pug')
require('dotenv').config()
const mysql = require('mysql')
const async = require('async')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const bodyParser = require('body-parser')
app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
const db = config.get('db')
app.use(cookieParser())
app.locals.env = process.env;
app.use(express.static('public'))
app.set('view engine', 'pug')
const multer = require('multer')
const sharp = require('sharp')
const cyrillicToTranslit = require('cyrillic-to-translit-js')

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'))
app.use('/vue', express.static(__dirname + '/node_modules/vue/dist'))
app.use('/vue-router', express.static(__dirname + '/node_modules/vue-router/dist'))
app.use('/axios', express.static(__dirname + '/node_modules/axios/dist'))
app.use('/vue-picture-input', express.static(__dirname + '/node_modules/vue-picture-input/umd'))
app.use('/material-icons', express.static(__dirname + '/node_modules/material-icons/css'))
app.use('/bootstrap-select', express.static(__dirname + '/node_modules/bootstrap-select/dist'))
app.use('/popperjs', express.static(__dirname + '/node_modules/popper.js/dist'))
app.use('/slick', express.static(__dirname + '/node_modules/slick-carousel/slick'))
app.use('/jquery-mousewheel', express.static(__dirname + '/node_modules/jquery-mousewheel'))
app.use('/minibarjs', express.static(__dirname + '/node_modules/minibarjs/dist'))




const Country = require('./models').country
const Brand = require('./models').brand
const Glazing = require('./models').glazing
const Material = require('./models').material
const Color = require('./models').color
const Product = require('./models').product
const Product_color = require('./models').product_color
const Product_image = require('./models').product_image
const Product_image_point = require('./models').product_image_point
const Brus = require('./models').brus
const Product_link = require('./models').product_link
const Gallery_group = require('./models').gallery_group
const Gallery = require('./models').gallery
const Gallery_image = require('./models').gallery_image





if (process.env.NODE_ENV != 'development') {
    app.use(function(req, res, next) {
        if (req.secure) {
            next()
        } else {
            res.redirect(301, 'https://' + req.headers.host + req.url)
        }
    })
}

app.all('*', (req, res, next) => {
    if (req.headers.host.match(/^www/) !== null ) {
        res.redirect(301, 'https://' + req.headers.host.replace(/^www\./, '') + req.url)
    } else {
        next()
    }
})






app.post('/test', async (req, res) => {

    // var product_image_point = await Product_image_point.findAll({
    //     include: [
    //         {
    //             model: Product
    //         },
    //         {
    //             model: Product_image
    //         }
    //     ]
    // })
    // res.json(product_image_point)

    // var product_image = await Product_image.findAll({
    //     include: [
    //         {
    //             model: Product
    //         },
    //         {
    //             model: Product_image_point
    //         }
    //     ]
    // })
    // res.json(product_image)

    // var product = await Product.findAll({
    //     include: [
    //         {
    //             model: Material
    //         },
    //         {
    //             model: Brand
    //         },
    //         {
    //             model: Product_color
    //         },
    //         {
    //             model: Product_image
    //         },
    //     ]
    // })
    // res.json(product)

    // var product_color = await Product_color.findAll({
    //     include: [
    //         {
    //             model: Product
    //         },
    //         {
    //             model: Color
    //         },
    //     ]
    // })
    // res.json(product_color)

    // var color = await Color.findAll({
    //     include: [
    //         {
    //             model: Material
    //         }
    //     ]
    // })
    // res.json(color)

    // var material = await Material.findAll({
    //     include: [
    //         {
    //             model: Color
    //         },
    //         {
    //             model: Product
    //         }
    //     ]
    // })
    // res.json(material)

    // var brand = await Brand.findAll({
    //     include: [
    //         {
    //             model: Country
    //         },
    //         {
    //             model: Product
    //         }
    //     ]
    // })
    // res.json(brand)

    // var country = await Country.findAll({
    //     include: [
    //         {
    //             model: Brand
    //         }
    //     ]
    // })
    // res.json(country)

})


function randomString() {
    var text = ""
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    for (var i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

var data = {}

app.get('*', async (req, res, next) => {
    data.productMenu = await Brand.findAll({
        include: [
            {
                model: Product,
                attributes: ['iProductID', 'sProductTitle', 'sProductURI', 'iMaterialID', 'iGenerateUriBrus', 'iGenerateUriMaterial'],
                required: true,
                include: [
                    {
                        model: Material,
                        attributes: ['sMaterialTitle']
                    },        
                    {
                        model: Brus,
                        attributes: ['sBrusTitle']
                    },        
                ]
            }
        ]
    })

    data.brandMenu = []

    data.productMenu.forEach((brand, index1) => {
        data.brandMenu.push({
            iBrandID: brand.iBrandID,
            sBrandTitle: brand.sBrandTitle,
            iCountryID: brand.iCountryID,
            products: {
                list: [],
                material: []
            }
        })

        brand.products.forEach((product, index2) => {

            var product_item = {
                iProductID: product.iProductID,
                sProductTitle: product.sProductTitle,
                sProductURI: product.sProductURI,
                iGenerateUriBrus: product.iGenerateUriBrus,
                iGenerateUriMaterial: product.iGenerateUriMaterial,
            }
            if (product.iGenerateUriBrus) {
                product_item.sBrusTitle = product.bru.sBrusTitle
            }

            if (product.iGenerateUriMaterial == 1) {

                var material_index = data.brandMenu[index1].products.material.findIndex(
                    function (material, index) {
                        return material.iMaterialID == product.iMaterialID
                    }
                )

                if (material_index < 0) {
                    data.brandMenu[index1].products.material.push(
                        {
                            iMaterialID: product.iMaterialID,
                            sMaterialTitle: product.material.sMaterialTitle,
                            list: []
                        }
                    )
                    material_index = data.brandMenu[index1].products.material.length-1
                }

                data.brandMenu[index1].products.material[material_index].list.push(product_item)

            } else {
                data.brandMenu[index1].products.list.push(product_item)
            }

        })        
    })

    // res.json(data.productMenu)
    // res.json(data.brandMenu)

    next()
})

data.left_menu = [
    {
        title: 'Главная',
        uri: '/',
        ico: [ '1.svg', '1a.svg' ]
    },
    {
        title: 'Окна',
        uri: '/product',
        ico: [ '2.svg', '2a.svg' ]
    },
    {
        title: 'Услуги',
        uri: '/',
        ico: [ '3.svg', '3a.svg' ]
    },
    {
        title: 'Галерея работ',
        uri: '/gallery',
        ico: [ '4.svg', '4a.svg' ]
    },
    {
        title: 'О компании',
        uri: '/company',
        ico: [ '5.svg', '5a.svg' ]
    },
    {
        title: 'Как мы работаем',
        uri: '/work',
        ico: [ '6.svg', '6a.svg' ]
    },
    {
        title: 'Словарь оконных терминов',
        uri: '/wiki',
        ico: [ '7.svg', '7a.svg' ]
    },
    {
        title: 'Сравнение профильных систем',
        uri: '/#s5',
        ico: [ '8.svg', '8a.svg' ]
    },
    {
        title: 'Контакты',
        uri: '/contact',
        ico: [ '9.svg', '9a.svg' ]
    },
]

data.times = [
    '00:00',
    '01:00',
    '02:00',
    '03:00',
    '04:00',
    '05:00',
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
]

app.get('/admin', auth.connect(basic), (req, res) => {
    res.render('admin.pug')
})
app.post('/admin/ProductList', async (req, res) => {
    var responce = {}
        responce.product = await Product.findAll({
            include: [Brand, Material, Brus]
        })
    res.json(responce)
})
app.post('/admin/ProductEdit', async (req, res) => {
    var responce = {}
        responce.brand = await Brand.findAll()
        responce.brus = await Brus.findAll()
        responce.material = await Material.findAll()
        responce.color = await Color.findAll({
            order: [
                ['iOrder', 'ASC'],
                ['iColorID', 'ASC']
            ]
        })
        if (req.body.iProductID) {
            responce.product = await Product.getProduct(Number(req.body.iProductID))
        }
    res.json(responce)
})
app.post('/admin/ProductUpdate', async (req, res) => {
    var iProductID = (req.body.product.iProductID) ? req.body.product.iProductID : false

    req.body.product.iProductParam1 = (req.body.product.iProductParam1) ? req.body.product.iProductParam1 : null
    req.body.product.iProductParam2 = (req.body.product.iProductParam2) ? req.body.product.iProductParam2 : null
    req.body.product.iProductParam3 = (req.body.product.iProductParam3) ? req.body.product.iProductParam3 : null
    req.body.product.iProductParam4 = (req.body.product.iProductParam4) ? req.body.product.iProductParam4 : null
    req.body.product.iProductParam5 = (req.body.product.iProductParam5) ? req.body.product.iProductParam5 : null
    req.body.product.iProductParam6 = (req.body.product.iProductParam6) ? req.body.product.iProductParam6 : null

    req.body.product.iGenerateUriMaterial = (req.body.product.iGenerateUriMaterial) ? 1 : 0
    req.body.product.iGenerateUriBrus = (req.body.product.iGenerateUriBrus) ? 1 : 0

    // Подготавливаем URI
    brand = await Brand.findByPk(req.body.product.iBrandID, {
        attributes: ['sBrandTitle']
    })
    var uri_string = brand.sBrandTitle + ' ' + req.body.product.sProductTitle

    if (req.body.product.iGenerateUriMaterial && req.body.product.iMaterialID) {
        material = await Material.findByPk(req.body.product.iMaterialID, {
            attributes: ['sMaterialTitle']
        })
        uri_string+= '_' + material.sMaterialTitle
    }

    if (req.body.product.iGenerateUriBrus && req.body.product.iBrusID) {
        brus = await Brus.findByPk(req.body.product.iBrusID, {
            attributes: ['sBrusTitle']
        })
        uri_string+= '_' + brus.sBrusTitle
    }

    req.body.product.sProductURI = cyrillicToTranslit().transform(uri_string, "_").toLowerCase()
    // *** //

    if (iProductID) {
        await Product.update(req.body.product, {
            where: {
                iProductID: iProductID
            }
        })
    } else {
        await Product.create(req.body.product).then((response) => {
            iProductID = response.iProductID
        })
    }

    const productImage = async () => {
        if (req.body.product.product_images) {
            for (const image of req.body.product.product_images) {
                image.iPhotoInDescOnPage = (image.iPhotoInDescOnPage) ? 1 : 0
                if (image.iProductImageID && image.del === true) {
                    await Product_image.destroy({
                        where: {
                            iProductImageID: image.iProductImageID
                        }
                    })
                } else if (image.iProductImageID) {
                    await Product_image.update({
                        sProductImageFrontName: image.sProductImageFrontName,
                        sProductImageBackName: image.sProductImageBackName,
                        iPhotoInDescOnPage: image.iPhotoInDescOnPage,
                        iOrder: image.iOrder,
                    }, {
                        where: {
                            iProductImageID: image.iProductImageID
                        }                    
                    })
                } else if (image.del !== true) {
                    await Product_image.create({
                        iProductID: iProductID,
                        sProductImageFrontName: image.sProductImageFrontName,
                        sProductImageBackName: image.sProductImageBackName,
                        iPhotoInDescOnPage: image.iPhotoInDescOnPage,
                        iOrder: image.iOrder,
                    })
                }
            }
        }
    }
    await productImage()

    const productImageColor = async () => {
        if (req.body.product.product_colors) {
            for (const image of req.body.product.product_colors) {
                if (image.iProductColorID && image.del === true) {
                    await Product_color.destroy({
                        where: {
                            iProductColorID: image.iProductColorID
                        }
                    })
                } else if (image.iProductColorID) {
                    await Product_color.update({
                        iColorID: image.iColorID,
                        sProductColorFilename: image.sProductColorFilename,
                    }, {
                        where: {
                            iProductColorID: image.iProductColorID
                        }                    
                    })
                } else if (image.del !== true) {
                    await Product_color.create({
                        iProductID: iProductID,
                        iColorID: image.iColorID,
                        sProductColorFilename: image.sProductColorFilename,
                    })
                }
            }
        }
    }
    await productImageColor()


    var responce = {}
        // responce.brand = await Brand.findAll()
        // responce.material = await Material.findAll()
        responce.product = await Product.getProduct(iProductID)
    res.json(responce)
})
app.post('/admin/ProductDelete', async (req, res) => {
    var iProductID = (req.body.product.iProductID) ? req.body.product.iProductID : false

    if (iProductID) {
        await Product.destroy({
            where: {
                iProductID: iProductID,
            }
        })
    }

    res.json(true)
})
app.post('/admin/upload', (req, res) => {

    var filename = randomString() + '.' + req.headers.extension

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/images/product/gallery')
        },
        filename: function (req, file, cb) {
            cb(null, filename)
        }
    })

    var upload = multer({ storage: storage }).single('file')

    upload(req, res, function (err, responce) {
        res.json(req.file)
    })
    
})
app.post('/admin/ProductUploadColor', (req, res) => {
    var filename = randomString() + '.' + req.headers.extension
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/images/product/color')
        },
        filename: function (req, file, cb) {
            cb(null, filename)
        }
    })
    var upload = multer({ storage: storage }).single('file')
    upload(req, res, function (err, responce) {
        res.json(req.file)
    })
})

app.post('/admin/ColorList', async (req, res) => {
    var data = {}
        data.material = await Material.findAll()
        data.color = await Color.findAll({
            include: [
                {
                    model: Material
                }
            ],
            order: [
                ['iMaterialID', 'ASC'],
                ['iOrder', 'ASC'],
                ['iColorID', 'ASC']
            ]
        })
    res.json(data)
})
app.post('/admin/ColorUpdate', async (req, res) => {

    var color = req.body.color

    if (color.iColorID && color.del === true) {
        await Color.destroy({
            where: {
                iColorID: color.iColorID
            }
        })
    } else if (color.iColorID) {
        await Color.update({
            iMaterialID: color.iMaterialID,
            sColorCode: color.sColorCode,
            sColorTitle: color.sColorTitle,
            sColorTitleCode: color.sColorTitleCode,
            sColorTextureFileName: color.sColorTextureFileName,
            iOrder: color.iOrder,
        }, {
            where: {
                iColorID: color.iColorID
            }                    
        })
    } else if (color.del !== true) {
        await Color.create({
            iMaterialID: color.iMaterialID,
            sColorCode: color.sColorCode,
            sColorTitle: color.sColorTitle,
            sColorTitleCode: color.sColorTitleCode,
            sColorTextureFileName: color.sColorTextureFileName,
            iOrder: color.iOrder,
        })
    }

    var data = {}
        data.color = await Color.findAll({
            include: [
                {
                    model: Material
                }
            ],
            order: [
                ['iMaterialID', 'ASC'],
                ['iOrder', 'ASC'],
                ['iColorID', 'ASC']
            ]
        })
    res.json(data)
})
app.post('/admin/ColorUpload', async (req, res) => {
    var filename = randomString() + '.' + req.headers.extension
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/images/color')
        },
        filename: function (req, file, cb) {
            cb(null, filename)
        }
    })
    var upload = multer({ storage: storage }).single('file')
    upload(req, res, function (err, responce) {
        res.json(req.file)
    })
})

app.post('/admin/GalleryList', async (req, res) => {
    var data = {}
        data.gallery_group = await Gallery_group.findAll()
        data.gallery = await Gallery.getList()
    res.json(data)
})
app.post('/admin/GalleryUpload', async (req, res) => {
    var filesName = []
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/images/gallery')
        },
        filename: function (req, file, cb) {
            var name = randomString() + '.' + file.originalname.split('.').pop()
            filesName.push(name)
            cb(null, 'temp_' + name)
        }
    })
    var upload = multer({ storage: storage }).array('file')
    upload(req, res, function (err, responce) {
        var check = 0
        filesName.forEach(name => {
            sharp('./public/images/gallery/' + 'temp_' + name)
            .resize(900, 900)
            .toFile('./public/images/gallery/' + name, function(err, response) {
                sharp.cache(false)
                check++
                if (check == filesName.length) {
                    res.send(filesName)
                }
            })            
        })        
    })
})
app.post('/admin/GalleryUpdate', async (req, res) => {

    var iGalleryID = req.body.gallery.iGalleryID

    if (iGalleryID) {
        await Gallery.update(req.body.gallery, {
            where: {
                iGalleryID: iGalleryID
            }
        })
    } else {
        await Gallery.create(req.body.gallery).then((response) => {
            console.log(response.dataValues.iGalleryID)
            iGalleryID = response.dataValues.iGalleryID
        })
    }



    const galleryImage = async () => {
        if (req.body.gallery.gallery_images) {
            for (const image of req.body.gallery.gallery_images) {
                if (image.iGalleryImageID && image.del === true) {
                    await Gallery_image.destroy({
                        where: {
                            iGalleryImageID: image.iGalleryImageID
                        }
                    })
                } else if (image.iGalleryImageID) {
                    await Gallery_image.update({
                        sGalleryImageName: image.sGalleryImageName,
                        iGalleryImageOrder: image.iGalleryImageOrder
                    }, {
                        where: {
                            iGalleryImageID: image.iGalleryImageID
                        }                    
                    })
                } else if (image.del !== true) {
                    await Gallery_image.create({
                        iGalleryID: iGalleryID,
                        sGalleryImageName: image.sGalleryImageName,
                        iGalleryImageOrder: image.iGalleryImageOrder
                    })
                }
            }
        }
    }
    await galleryImage()

    

    var data = {}
        data.gallery = await Gallery.getList()
    res.json(data)
})
app.post('/admin/GalleryRemove', async (req, res) => {
    await Gallery.destroy({
        where: {
            iGalleryID: req.body.iGalleryID,
        }
    })
    var data = {}
        data.gallery = await Gallery.getList()
    res.json(data)
})




// cookie
// app.use(function (req, res, next) {
//     var cookie = req.cookies.cookieName;
//     if (cookie === undefined) {
//         var randomNumber = Math.random().toString()
//         randomNumber = randomNumber.substring(2,randomNumber.length)
//         res.cookie('cookieName', randomNumber, { maxAge: 900000, httpOnly: true })
//     } else {
//         console.log('cookie exists', cookie)
//     }
//     next()
// });

app.get('/', (req, res) => {
    data.title = 'Просто окна'
    data.description = 'Просто Окна – замер, проектирование, изготовление и реализация светопрозрачных конструкций любых типов: пластиковые окна ПВХ, алюминиевые окна, деревянные окна из евробруса, витражи, фасады и стоечно-ригельные системы. Монтажные работы любой сложности. Окна от производителя по лучшим ценам в Москве, МО и России. Мы не занимаемся накруткой цены, вы точно знаете, за что платите. Просто Окна – с нами просто.'
    data.left_menu_active = 0
    data.s2_menu = [
        {
            title: 'Окна',
            img: '1.svg',
            list: [
                {
                    title: 'Пластик',
                    uri: '#',
                    list: [
                        {
                            title: 'Rehau',
                            uri: '#',
                            list: [
                                {
                                    title: 'Euro',
                                    uri: '/product/rehau_euro'
                                },
                                {
                                    title: 'Blitz New',
                                    uri: '/product/rehau_blitz_new'
                                },
                                {
                                    title: 'Grazio',
                                    uri: '/product/rehau_grazio'
                                },
                                {
                                    title: 'Delight',
                                    uri: '/product/rehau_delight'
                                },
                                {
                                    title: 'Brillant',
                                    uri: '/product/rehau_brillant'
                                },
                                {
                                    title: 'Intelio',
                                    uri: '/product/rehau_intelio'
                                },
                                {
                                    title: 'Geneo',
                                    uri: '/product/rehau_geneo'
                                },
                            ]
                        },
                        {
                            title: 'KBE',
                            uri: '#',
                            list: [
                                {
                                    title: 'KBE 58',
                                    uri: '/product/kbe_58'
                                },
                                {
                                    title: 'KBE 70 Expert',
                                    uri: '/product/kbe_expert'
                                },
                                {
                                    title: 'KBE 76',
                                    uri: '/product/kbe_76'
                                },
                            ]
                        },
                        {
                            title: 'Montblanc',
                            uri: '#',
                            list: [
                                {
                                    title: 'Eco',
                                    uri: '/product/montblanc_eco'
                                },
                                {
                                    title: 'Nord',
                                    uri: '/product/montblanc_nord'
                                },
                                {
                                    title: 'Thermo',
                                    uri: '#'
                                },
                            ]
                        },
                        {
                            title: 'Novotex',
                            uri: '#',
                            list: [
                                {
                                    title: 'Techno 58',
                                    uri: '/product/novotex_techno_58'
                                },
                                {
                                    title: 'Techno 70',
                                    uri: '/product/novotex_techno_70'
                                },
                            ]
                        },
                        {
                            title: 'Wintech',
                            uri: '#',
                            list: [
                                {
                                    title: 'Isotech 530',
                                    uri: '/product/wintech_isotek_530'
                                },
                                {
                                    title: 'Thermotech 742',
                                    uri: '/product/wintech_thermotek_742'
                                },
                            ]
                        },
                        {
                            title: 'Gutwerk',
                            uri: '#',
                            list: [
                                {
                                    title: 'Gutwerk 58',
                                    uri: '/product/kbe_gut_gutwerk_58'
                                },
                                {
                                    title: 'Gutwerk 70',
                                    uri: '/product/kbe_master_gutwerk'
                                },
                            ]
                        },
                        {
                            title: 'Slidors',
                            uri: '#'
                        },
                    ]
                },
                {
                    title: 'Алюминий',
                    uri: '#',
                    list: [
                        {
                            title: 'Seal',
                            uri: '#',
                            list: [
                                {
                                    title: 'КПТ 45',
                                    uri: '/product/seal_45'
                                },
                                {
                                    title: 'КПТ 74',
                                    uri: '/product/seal_74'
                                },
                                {
                                    title: 'КП 50',
                                    uri: '/product/seal_kp50'
                                },
                            ]
                        },
                        {
                            title: 'Alutech',
                            uri: '#',
                            list: [
                                {
                                    title: 'ALT C48',
                                    uri: '/product/alutech_alt_c48'
                                },
                                {
                                    title: 'ALT W62',
                                    uri: '/product/alutech_alt_w62'
                                },
                                {
                                    title: 'F50',
                                    uri: '/product/alutech_f50'
                                },
                            ]
                        },
                        {
                            title: 'Provedal',
                            uri: '#',
                            list: [
                                {
                                    title: 'p480',
                                    uri: '#'
                                },
                                {
                                    title: 'c640',
                                    uri: '#'
                                },
                            ]
                        },
                    ]
                },
                {
                    title: 'Дерево евробрус',
                    uri: '#',
                    list: [
                        {
                            title: 'Сосна',
                            uri: '#',
                            list: [
                                {
                                    title: 'Эконом',
                                    uri: '#'
                                },
                                {
                                    title: 'Сращенный евробрус',
                                    uri: '/product/sosna_srashchennaya'
                                },
                                {
                                    title: 'Цельный евробрус',
                                    uri: '/product/sosna_tselnolamelnaya'
                                },
                            ]
                        },
                        {
                            title: 'Лиственница',
                            uri: '#',
                            list: [
                                {
                                    title: 'Сращенный евробрус',
                                    uri: '/product/listvennitsa_srashchennaya'
                                },
                                {
                                    title: 'Цельный евробрус',
                                    uri: '/product/listvennitsa_tselnolamelnaya'
                                },
                            ]
                        },
                        {
                            title: 'Дуб',
                            uri: '#',
                            list: [
                                {
                                    title: 'Сращенный евробрус',
                                    uri: '/product/dub_srashchennaya'
                                },
                                {
                                    title: 'Цельный евробрус',
                                    uri: '/product/dub_tselnolamelnaya'
                                },
                            ]
                        },
                        {
                            title: 'Меранти',
                            uri: '#'
                        },
                    ]
                },
                {
                    title: 'Дизайн окна',
                    uri: '#',
                    list: [
                        {
                            title: 'Каталог ламинации',
                            uri: '/palette'
                        },
                        {
                            title: 'Каталог RAL',
                            uri: '/palette'
                        }
                    ]
                },
                {
                    title: 'Опции',
                    uri: '/options'
                },
                {
                    title: 'Видео "Как просто выбрать окно"',
                    uri: '#s3'
                },
                {
                    title: 'Интуйтивный выбор окон',
                    uri: '/intuitive'
                },
            ]
        },
        {
            title: 'Услуги',
            img: '2.svg',
            list: [
                {
                    title: 'Вызов замерщика',
                    uri: '/gager'
                },
                {
                    title: 'Установка окон',
                    uri: '#',
                    list: [
                        {
                            title: 'Установка от Просто Окна',
                            uri: '#',
                            list: [
                                {
                                    title: 'Премиум монтаж',
                                    uri: '#'
                                },
                                {
                                    title: '10 плюсов монтажа от Просто Окна',
                                    uri: '#'
                                },
                                {
                                    title: 'Гарантия',
                                    uri: '#'
                                },
                            ]
                        },
                        {
                            title: 'Своими руками',
                            uri: '#',
                            list: [
                                {
                                    title: 'Обучение монтажу',
                                    uri: '#'
                                },
                                {
                                    title: 'Регулировка',
                                    uri: '/regulation_window'
                                },
                                {
                                    title: 'Инструкция по предварительному замеру',
                                    uri: '/optional_service'
                                },
                            ]
                        },
                    ]
                },
                {
                    title: 'Установка откосов',
                    uri: '#'
                },
                {
                    title: 'Установка подоконников',
                    uri: '#',
                    list: [
                        {
                            title: 'Заделка шва под подоконником',
                            uri: '#'
                        }
                    ]
                },
                {
                    title: 'Отделка балконов',
                    uri: '#',
                    list: [
                        {
                            title: 'Построение крыши',
                            uri: '#'
                        },
                        {
                            title: 'Построение выноса',
                            uri: '#'
                        },
                        {
                            title: 'Обшивка балконов',
                            uri: '#'
                        },
                        {
                            title: 'Материалы для отделки',
                            uri: '#'
                        },
                    ]
                },
                {
                    title: 'Окосячка',
                    uri: '#'
                },
                {
                    title: 'Вывоз мусора',
                    uri: '#'
                },
                {
                    title: 'Клининг после установки',
                    uri: '#'
                },
                {
                    title: 'Доставка',
                    uri: '#'
                },
                {
                    title: 'Сервисное обслуживание',
                    uri: '#'
                },
            ]
        },
        {
            title: 'Комплектующие',
            img: '3.svg',
            list: [
                {
                    title: 'Подоконники',
                    uri: '#',
                    list: [
                        {
                            title: 'Каталог с ценами',
                            uri: '/options'
                        }
                    ]
                },
                {
                    title: 'Ручки',
                    uri: '#',
                    list: [
                        {
                            title: 'Каталог с ценами',
                            uri: '/options'
                        }
                    ]
                },
                {
                    title: 'Шторы',
                    uri: '#',
                    list: [
                        {
                            title: 'Каталог с ценами',
                            uri: '/options'
                        }
                    ]
                },
                {
                    title: 'Жалюзи',
                    uri: '#',
                    list: [
                        {
                            title: 'Каталог с ценами',
                            uri: '/options'
                        }
                    ]
                },
                {
                    title: 'Клапаны',
                    uri: '#',
                    list: [
                        {
                            title: 'Каталог с ценами',
                            uri: '/options'
                        }
                    ]
                },
                {
                    title: 'Москитные сетки',
                    uri: '#',
                    list: [
                        {
                            title: 'Каталог с ценами',
                            uri: '/options'
                        }
                    ]
                },
            ]
        },
        {
            title: 'Цены',
            img: '4.svg',
            list: [
                {
                    title: 'Калькулятор',
                    uri: '#s6'
                },
                {
                    title: 'Заказать расчет',
                    uri: '#'
                },
                {
                    title: 'Лучшая цена',
                    uri: '#'
                },
                {
                    title: 'Оплата',
                    uri: '/pay'
                },
                {
                    title: 'Цены по типу дома',
                    uri: '#'
                },
                {
                    title: 'Рассрочка',
                    uri: '#'
                },
            ]
        },
        {
            title: 'Wiki окна',
            img: '5.svg',
            list: [
                {
                    title: 'Словарь оконных терминов',
                    uri: '/wiki'
                },
                {
                    title: 'История',
                    uri: '/wiki'
                },
                {
                    title: 'Профили',
                    uri: '/wiki'
                },
                {
                    title: 'Сравнительные характеристики профильных систем',
                    uri: '/wiki'
                },
                {
                    title: 'Фурнитура',
                    uri: '/wiki'
                },
                {
                    title: 'Стекло и стеклопакеты',
                    uri: '/wiki'
                },
                {
                    title: 'Монтаж',
                    uri: '/wiki'
                },
                {
                    title: 'Балконы',
                    uri: '/wiki'
                },
                {
                    title: 'Двери',
                    uri: '/wiki'
                },
            ]
        },
        {
            title: 'Корпоративным клиентам',
            img: '6.svg',
            list: [
                {
                    title: 'Страница с описанием',
                    uri: '/corporate'
                },
                {
                    title: 'PDF презентация для скачивания',
                    uri: '#'
                },
                {
                    title: 'Услуги корпоративного монтажа',
                    uri: '#'
                },
                {
                    title: 'Личный кабинет',
                    uri: '#'
                },
            ]
        },
        {
            title: 'Акции/новое',
            img: '7.svg',
            list: [
                {
                    title: 'Акция "Найдите дешевле"',
                    uri: '#'
                }
            ]
        },
        {
            title: 'Компания',
            img: '8.svg',
            list: [
                {
                    title: 'Контакты',
                    uri: '/contact'
                },
                {
                    title: 'О компании',
                    uri: '/company'
                },
                {
                    title: 'Как мы работаем',
                    uri: '#'
                },
                {
                    title: 'Гарантия',
                    uri: '#'
                },
                {
                    title: 'Новости',
                    uri: '/news'
                },
                {
                    title: 'Инновации',
                    uri: '#',
                    list: [
                        {
                            title: 'Заработайте с нами',
                            uri: '#'
                        },
                        {
                            title: 'Вместе еще дешевле',
                            uri: '/cheaper-together'
                        },
                        {
                            title: 'Освященные окна',
                            uri: '#'
                        },
                        {
                            title: 'Благотворительность',
                            uri: '#'
                        },
                    ]
                },
            ]
        },
    ]
    res.render('index.pug', data)
})

app.get('/calc_data', (req, res) => {
    fs.readFile('./public/calc_data.json', 'utf8', function (err, data) {
        if (err) throw err
        res.json(JSON.parse(data))
    })    
})

app.get('/contact', (req, res) => {
    data.title = 'Контакты'
    data.description = ''
    data.left_menu_active = null
    res.render('contact.pug', data)
})

app.get('/gager', (req, res) => {
    data.title = 'Замерщик'
    data.description = ''
    data.left_menu_active = null
    res.render('gager.pug', data)
})

app.get('/product', async (req, res) => {
    data.title = 'Окна'
    data.description = ''
    data.left_menu_active = 1
    data.product = null
    // data.products = await Product.findAll({
    //     attributes: ['sProductTitle', 'sProductURI'],
    //     include: [
    //         {
    //             model: Brand,
    //             attributes: ['sBrandTitle']
    //         }
    //     ]
    // })
    // res.json(data.productMenu)
    res.render('product/products.pug', data)
})

app.get('/product/:sProductURI', async (req, res) => {
    console.log('product page', req.params.sProductURI)
    data.title = 'Окна'
    data.description = ''
    data.left_menu_active = 1
    data.products = await Product.findAll({
        attributes: ['sProductTitle', 'sProductURI'],
        include: [
            {
                model: Brand,
                attributes: ['sBrandTitle']
            },
            {
                model: Material,
                attributes: ['sMaterialTitle']
            },
            {
                model: Brus
            }

        ]
    })
    data.material = await Material.findAll()
    data.brus = await Brus.findAll()

    data.product = await Product.getProduct(req.params.sProductURI)
    

    // res.json(data.material)
    res.render('product.pug', data)
})

app.get('/pay', (req, res) => {
    data.title = 'Оплата'
    data.description = ''
    data.left_menu_active = null
    res.render('pay.pug', data)
})

app.get('/palette', (req, res) => {
    data.title = 'Палитра'
    data.description = ''
    data.left_menu_active = null
    res.render('palette.pug', data)
})

app.get('/options', (req, res) => {
    data.title = 'Опции'
    data.description = ''
    data.left_menu_active = null
    res.render('options.pug', data)
})



data.catalog = []
var catalog_item = {
    title: "Особые стекла для пластиковых окон ПВХ",
    desc: "Стеклопакет – важнейший элемент ПВХ окна. От его качества зависят ведущие свойства окна из пластика в целом – шумоизоляция, параметры сохранения тепла в жилище и даже безопасность проживающих в помещении. Чтобы пластиковые окна ПВХ"
}
for (let index = 0; index < 10; index++) {
    data.catalog.push(catalog_item);
}

app.get('/wiki', (req, res) => {
    data.title = 'Вики'
    data.description = ''
    data.left_menu_active = 6
    res.render('wiki/catalog.pug', data)
})

app.get('/wiki/get', (req, res) => {
    res.render('wiki/catalog_list.pug', data)
})

app.get('/wiki/article', (req, res) => {
    data.title = 'Wiki article'
    data.description = ''
    data.left_menu_active = 6
    res.render('wiki/article.pug', data)
})

app.get('/instruction', (req, res) => {
    data.title = 'Instruction'
    data.description = ''
    data.left_menu_active = null
    res.render('instruction/instruction.pug', data)
})

app.get('/instruction/video', (req, res) => {
    data.title = 'Instruction Video'
    data.description = ''
    data.left_menu_active = null
    res.render('instruction/video.pug', data)
})

app.get('/company', (req, res) => {
    data.title = 'О компании'
    data.description = ''
    data.left_menu_active = null
    res.render('company/company.pug', data)
})

app.get('/cheaper-together', (req, res) => {
    data.title = 'Вместе еще дешевле'
    data.description = ''
    data.left_menu_active = null
    res.render('company/innovation/cheaper-together.pug', data)
})

app.get('/news', (req, res) => {
    data.title = 'news'
    data.description = ''
    data.left_menu_active = null
    //где апи по новостям и запросы??
    res.render('company/news/news.pug', data)
})

app.get('/news-tape', (req, res) => {
    data.title = 'news-tape'
    data.description = ''
    data.left_menu_active = null
    //где апи по новостям и запросы??
    res.render('company/news/news-tape.pug', data)
})

app.get('/favorites', (req, res) => {
    data.title = 'favorites'
    data.description = ''
    data.left_menu_active = null
    //где апи по новостям и запросы??
    res.render('favorites/favorites.pug', data)
})

app.get('/page-brand', (req, res) => {
    data.title = 'page-brand'
    data.description = ''
    data.left_menu_active = null
    //где апи по новостям и запросы??
    res.render('page-brand/page-brand.pug', data)
})
//app.get('/cheaper-together', (req, res) => {
    //res.render('company/company.pug', data)
//})

app.get('/corporate', (req, res) => {
    data.title = 'Corporate'
    data.description = ''
    data.left_menu_active = null
    res.render('corporate/corporate.pug', data)
})

app.get('/regulation_window', (req, res) => {
    data.title = 'Регулировка окон'
    data.description = ''
    data.left_menu_active = null
    res.render('regulation_window/regulation_window.pug', data)
})

app.get('/optional_service', (req, res) => {
    data.title = 'Дополнительные услуги'
    data.description = ''
    data.left_menu_active = null
    res.render('optional_service/optional_service.pug', data)
})

app.get('/intuitive', (req, res) => {
    data.title = 'Интуйтивный подбор окон'
    data.description = ''
    data.left_menu_active = null
    res.render('intuitive/intuitive.pug', data)
})

app.get('/gallery', async (req, res) => {
    data.title = 'Галлерея'
    data.description = ''
    data.left_menu_active = 3
    data.gallery_group = await Gallery_group.findAll()
    data.gallery_group_active = false
    data.gallery = await Gallery.getList()
    res.render('gallery', data)
})
app.get('/gallery/:sGalleryGroupUri', async (req, res) => {
    data.title = 'Галлерея'
    data.description = ''
    data.left_menu_active = 3
    data.gallery_group = await Gallery_group.findAll()
    data.gallery_group_active = req.params.sGalleryGroupUri
    data.gallery = await Gallery.getList({
        sGalleryGroupUri: req.params.sGalleryGroupUri
    })
    res.render('gallery', data)
})
app.get('/gallery/:sGalleryGroupUri/:iGalleryID', async (req, res) => {
    data.title = 'Галлерея ' + req.params.iGalleryID
    data.description = ''
    data.left_menu_active = 3
    data.gallery_group = await Gallery_group.findAll()
    data.gallery_group_active = req.params.sGalleryGroupUri
    data.gallery_list = await Gallery.getList({
        sGalleryGroupUri: req.params.sGalleryGroupUri
    })
    data.gallery = await Gallery.getList({
        iGalleryID: req.params.iGalleryID
    })
    // res.json(data.gallery_list)
    res.render('gallery/item', data)
})
app.get('/work', async (req, res) => {
    data.title = 'Как мы работаем'
    data.description = ''
    data.left_menu_active = 5
    res.render('work', data)
})
app.get('/calculation', async (req, res) => {
    data.title = 'Заказать точный расчет'
    data.description = ''
    data.left_menu_active = null
    res.render('calculation', data)
})




app.post('/send', (req, res) => {

    // res.send(200)

    var name = req.body.name
    var tel = req.body.tel
    var email = req.body.email
    var from = req.body.from
    var to = req.body.to
    var subject = req.body.subject
    var message = req.body.message

    if (name.length) {
        var mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_KEY, domain: process.env.MAILGUN_DOMAIN})

        var message_html = ""
        if (name) {
            message_html+= "<p>Имя: <b>" + name + "</b></p>"
        }
        if (tel) {
            message_html+= "<p>Телефон: <b>" + tel + "</b></p>"
        }
        if (email) {
            message_html+= "<p>Электронная почта: <b>" + email + "</b></p>"
        }
        if (from) {
            message_html+= "<p>Время звонка от: <b>" + from + "</b></p>"
        }
        if (to) {
            message_html+= "<p>Время звонка до: <b>" + to + "</b></p>"
        }
        if (subject) {
            message_html+= "<p>Тема обращения: <b>" + subject + "</b></p>"
        }
        if (message) {
            message_html+= "<p>Сообщение: <b>" + message + "</b></p>"
        }

        var data = {
            from: 'prostokna.ru <noreply@prostokna.ru>',
            to: '<prosto@prostokna.ru>',
            subject: 'Заявка',
            text: message_html,
            html: message_html
        };
        
        mailgun.messages().send(data, function (error, body) {
            // console.log(body);
        })
    }

    res.sendStatus(200)


    
})

//API
app.get('/all_windows', async (req, res) => {
    var result = await Product.findAll({
        include: [
            {
                model: Brand
            }
        ]
    })
    res.json(result)
    // let connection = mysql.createConnection(config.get('db'))
    // let query = "SELECT t1.sProductTitle, t1.MountingDepth, t1.Profile, t1.ProfileClass, t1.DoubleGlazing, t1.HeatTransferResistance, t1.ShapikShapeOptions, t1.DecorationOptions, t1.FrameFeature, t2.BrandНomeland, t2.sBrandTitle FROM product t1 LEFT JOIN brand t2 ON t2.iBrandID = t1.iBrandID";

    // connection.query(query, (err, rows, fields) => {
    //     if (err) {
    //         console.log('Error query: ' + err)
    //         res.sendStatus(500)
    //         return
    //     }
    //     res.json(rows)
    // })
    // connection.end()
})


if (process.env.NODE_ENV != 'development') {
    var https_options = {
        key: fs.readFileSync("encryption/private.key"),
        cert: fs.readFileSync("encryption/server.crt"),
        ca: [
            fs.readFileSync('encryption/mydomain.ca-bundle')
        ]
    }

    const https = require('https').createServer(https_options, app)
    https.listen(443, () => {
        console.log('Server https is running')
    })
}
app.listen(process.env.PORT, () => {
    console.log('Server is running http://localhost:' + process.env.PORT)
})

// http.listen(process.env.PORT || 8080, () => {
//     // console.clear()
//     console.log('Server is running on http://localhost:' + process.env.PORT || 8080)
// })
