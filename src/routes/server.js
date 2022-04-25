const express = require('express')
const sqlServer = require('mssql')

const sqlConfig = {
    user: "sa",
    password: "123456",
    database: "QLBH",
    port: "1433",
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

function createServer(serverName) {
    const app = express()
    const config = {server: "localhost\\" + serverName, ...sqlConfig}
    console.log('config ', config)
    const sql = new sqlServer.ConnectionPool(config)
    sql.connect(err => {
        console.log("connect %s successfully", serverName)
        console.log(err)

    })

    app.get('/', async (req, res) => {
        res.json({
            server: serverName
        })
    })

    app.route('/products').get(async (req, res) => {
        const products = await sql.query`SELECT * FROM SANPHAM`
        res.json(beautifyProductJson(products.recordset))
    }).post((req, res) => {
        try {
            let request = req.body;
            console.log(request)
            sql.query("INSERT INTO SANPHAM (MASP,TENSP,DVT,NUOCSX,GIA,SOLUONGTON) VALUES ('" +
                request.idProduct + "',N'" +
                request.nameProduct + "',N'" +
                request.dvt + "',N'" +
                request.country + "'," +
                request.price + "," +
                request.amount +
                ")", (err, _) => {
                if (err == null) {
                    res.sendStatus(200)
                } else {
                    console.log(err)
                    console.log("INSERT INTO SANPHAM (MASP,TENSP,DVT,NUOCSX,GIA,SOLUONGTON) VALUES ('" +
                        request.idProduct + "',N'" +
                        request.nameProduct + "',N'" +
                        request.dvt + "',N'" +
                        request.country + "'," +
                        request.price + "," +
                        request.amount +
                        ")")
                    res.sendStatus(400)
                }
            })
        } catch (e) {
            console.error(e)
        }
    })

    app.route('/product/:id(\\d+)').get(async (req, res) => {
        const product = await sql.query`SELECT * FROM SANPHAM WHERE ID = ${req.params.id}`
        res.json(beautifyProductJson(product.recordset)[0])
    }).delete(async (req, res) => {
        try {
            sql.query('DELETE FROM SANPHAM WHERE ID = ' + req.params.id, (err, _) => {
                if (err == null) res.sendStatus(200); else res.sendStatus(400)
            })
        } catch (e) {
            console.error(e)
        }
    }).put(async (req, res) => {
        try {
            let request = req.body;
            sql.query("UPDATE SANPHAM SET " + "MASP = '"
                + request.idProduct + "', TENSP =N'"
                + request.nameProduct + "',DVT = N'"
                + request.dvt + "',NUOCSX = '"
                + request.country + "',GIA = "
                + request.price + ",SOLUONGTON= "
                + request.amount
                + " WHERE ID =" + req.params.id
                , (err, _) => {
                    if (err == null) res.sendStatus(200); else {
                        res.sendStatus(400)
                        console.log(request)
                    }
                })
        } catch (e) {
            console.error(e)
        }
    })

    app.route('/staffs').get(async (req, res) => {
        const staffs = await sql.query`SELECT * FROM NHANVIEN`
        res.json(beautifyStaffJson(staffs.recordset))
    }).post((req, res) => {
        try {
            let request = req.body;
            console.log(request)
            sql.query("INSERT INTO NHANVIEN (MANV,HOTEN,SODT,NGVL,LUONG,MACN) VALUES ('" +
                request.staffId + "',N'" +
                request.staffName + "','" +
                request.phoneNumber + "','" +
                request.dob + "'," +
                request.salary + ",'" +
                request.branchCode +
                "')", (err, _) => {
                if (err == null) {
                    res.sendStatus(200)
                } else {
                    console.log(err)
                    res.sendStatus(400)
                }
            })
        } catch (e) {
            console.error(e)
        }
    })

    app.route('/staff/:id(\\d+)').get(async (req, res) => {
        const staffs = await sql.query`SELECT * FROM NHANVIEN WHERE ID = ${req.params.id}`
        res.json(beautifyStaffJson(staffs.recordset)[0])
    }).delete((req, res) => {
        sql.query('DELETE FROM NHANVIEN WHERE ID = ' + req.params.id, (err, _) => {
            if (err == null) {
                res.sendStatus(200)
            } else {
                console.error(err)
                res.sendStatus(400)
            }
        })
    }).put(async (req, res) => {
        try {
            let request = req.body;
            sql.query("UPDATE NHANVIEN SET " + "MANV = '"
                + request.staffId + "', HOTEN =N'"
                + request.staffName + "',SODT = '"
                + request.phoneNumber + "',NGVL = '"
                + request.dob + "',LUONG = "
                + request.salary + ",MACN= '"
                + request.branchCode
                + "' WHERE ID =" + req.params.id
                , (err, _) => {
                    if (err == null) res.sendStatus(200); else {
                        res.sendStatus(400)
                        console.log(request)
                        console.log(err)
                    }
                })
        } catch (e) {
            console.error(e)
        }
    })
    return app
}


function beautifyProductJson(json) {
    json.forEach((e) => {
        renameKey(e, 'ID', 'id')
        renameKey(e, 'MASP', 'idProduct')
        renameKey(e, 'TENSP', 'nameProduct')
        renameKey(e, 'DVT', 'dvt')
        renameKey(e, 'GIA', 'price')
        renameKey(e, 'NUOCSX', 'country')
        renameKey(e, 'SOLUONGTON', 'amount')
        renameKey(e, 'rowguid', 'uuid')
    })
    return json
}

function beautifyStaffJson(json) {
    json.forEach((e) => {
        renameKey(e, 'ID', 'id')
        renameKey(e, 'MANV', 'staffId')
        renameKey(e, 'HOTEN', 'staffName')
        renameKey(e, 'SODT', 'phoneNumber')
        renameKey(e, 'NGVL', 'dob')
        renameKey(e, 'LUONG', 'salary')
        renameKey(e, 'MACN', 'branchCode')
        renameKey(e, 'rowguid', 'uuid')
        e.branchCode = e.branchCode.trim()
        e.staffId = e.staffId.trim()
    })
    return json
}

function renameKey(obj, oldKey, newKey) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
}

module.exports = createServer
