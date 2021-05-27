const { con } = require('../../config/db')

//====>>>> Data
module.exports.data = (req, res) => {
    const isAdmin = res.currentUser.isAdmin

    let AdminLobArray, AdminBranchArray, AdminTerritoryArray;

    if (res.currentUser.isAdmin === 1) {
        con.query("SELECT lob from `lob_master`", (error, result) => {
            if (error) return res.status(401).send("Data not fetched")
            //use name instead of "lob" and "territory" =====>>
            AdminLobArray = result.map(l => l.lob)
            con.query("SELECT name from `branch_master`", (error, result) => {
                if (error) return res.status(401).send("Data not fetched")
                AdminBranchArray = result.map(b => b.name)

                con.query("SELECT territory from `territory_master`", (error, result) => {
                    if (error) return res.status(401).send("Data not fetched")
                    AdminTerritoryArray = result.map(t => t.territory)

                    con.query("SELECT LOB, Branch,Territory_Name,ProductGroup1, Product_Group2,Billed_Qty_PCs_LY,sum(Billed_Qty_PCs_LY),Billed_Qty_PCs_TY,sum(Billed_Qty_PCs_TY), Billed_Qty_NA_TY,sum(Billed_Qty_NA_TY),Billed_Qty_NA_LY,sum(Billed_Qty_NA_LY), sum(Billed_Amount_LY),sum(Billed_Amount_TY) FROM `fulldata` WHERE LOB IN ? AND Branch IN ? AND Territory_Name IN ?  group by LOB, Branch,ProductGroup1, Product_Group2, Year, Month", [[AdminLobArray], [AdminBranchArray], [AdminTerritoryArray]], (error, result) => {
                        if (error) return res.status(401).send("Data not fetched")

                        res.send(result)
                    })
                })
            })
        })
    } else {
        con.query("SELECT LOB, Branch,Territory_Name,ProductGroup1, Product_Group2,Billed_Qty_PCs_LY,sum(Billed_Qty_PCs_LY),Billed_Qty_PCs_TY,sum(Billed_Qty_PCs_TY), Billed_Qty_NA_TY,sum(Billed_Qty_NA_TY),Billed_Qty_NA_LY,sum(Billed_Qty_NA_LY), sum(Billed_Amount_LY),sum(Billed_Amount_TY) FROM `fulldata` WHERE LOB IN ? AND Branch IN ? AND Territory_Name IN ?  group by LOB, Branch,ProductGroup1, Product_Group2, Year, Month", [[res.currentUser.role.LOB],[res.currentUser.role.branches], [res.currentUser.role.territory]],(nonAdminError, nonAdminResult) => {
            if (nonAdminError) return res.status(401).send("Data not fetched")

            res.send(nonAdminResult)
        })
    }
}