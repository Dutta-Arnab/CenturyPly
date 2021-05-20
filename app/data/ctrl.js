const { con } = require('../../config/db')

module.exports.data = (req, res) => {
    // console.log("DATA---------", res.currentUser);
    // const user = res.currentUser
    // const isAdmin = (JSON.parse(res.currentUser.isAdmin))
    // const lob = (JSON.parse(JSON.parse(res.currentUser.role).LOB
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

                    con.query("SELECT LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,Billed_Qty_PCs,sum(Billed_Qty_PCs), Billed_Qty_NA,sum(Billed_Qty_NA), DATE_FORMAT(InvoiceDt,'%Y') Year,DATE_FORMAT(InvoiceDt,'%m') month, sum(Billed_Amount), Target FROM `master_data` WHERE LOB IN ? AND Branch_Name IN ? group by LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,  Year, month", [[AdminLobArray], [AdminBranchArray], [AdminTerritoryArray]], (error, result) => {
                        if (error) return res.status(401).send("Data not fetched")

                        res.send(result)
                    })
                })
            })
        })
    } else {
        // console.log("lob", res.currentUser.role.LOB);
        // console.log("branches", res.currentUser.role.branches);
        // console.log("territory", res.currentUser.role.territory);

        // const lobArray = res.currentUser.role.LOB.map(l => l.name)
        // console.log(lobArray);
        // const branchArray = res.currentUser.role.branches.map(b => b.name)
        // console.log(branchArray);
        // //const territoryArray = res.currentUser.role.territory.map(t => t.name)

        con.query("SELECT LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,Billed_Qty_PCs,sum(Billed_Qty_PCs), Billed_Qty_NA,sum(Billed_Qty_NA), DATE_FORMAT(InvoiceDt,'%Y') Year,DATE_FORMAT(InvoiceDt,'%m') month, sum(Billed_Amount), Target FROM `master_data` WHERE LOB IN ? AND Branch_Name IN ?  group by LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,  Year, month", [[res.currentUser.role.LOB],[res.currentUser.role.branches], [res.currentUser.role.territory]],(nonAdminError, nonAdminResult) => {
            if (nonAdminError) return res.status(401).send("Data not fetched")

            res.send(nonAdminResult)
        })
    }

    // con.query("SELECT lob from `lob_master`", (error, result) => {
    //     if (error) return res.status(401).send("Data not fetched")
    //     AdminLobArray = result.map(l => l.lob)
    //     con.query("SELECT name from `branch_master`", (error, result) => {
    //         if (error) return res.status(401).send("Data not fetched")
    //         AdminBranchArray = result.map(b => b.name)

    //         con.query("SELECT territory from `territory_master`", (error, result) => {
    //             if (error) return res.status(401).send("Data not fetched")
    //             AdminTerritoryArray = result.map(t => t.lob)

    //             if (isAdmin !== 1 && !AdminLobArray && !AdminBranchArray) {
    //                 con.query("SELECT LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,Billed_Qty_PCs,sum(Billed_Qty_PCs), Billed_Qty_NA,sum(Billed_Qty_NA), DATE_FORMAT(InvoiceDt,'%Y') Year,DATE_FORMAT(InvoiceDt,'%m') month, sum(Billed_Amount), Target FROM `master_data` WHERE LOB IN ? AND Branch_Name IN ? AND Territory_Name in ? group by LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,  Year, month", [[lobArray], [branchArray], [territoryArray]], (error, result) => {
    //                     // if (error) return res.status(401).send("Data not fetched")
    //                     //console.log(brachesssss);
    //                     if (error) return res.send(error)

    //                     res.send(result)
    //                 })
    //             }
    //             else {
    //                 con.query("SELECT LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,Billed_Qty_PCs,sum(Billed_Qty_PCs), Billed_Qty_NA,sum(Billed_Qty_NA), DATE_FORMAT(InvoiceDt,'%Y') Year,DATE_FORMAT(InvoiceDt,'%m') month, sum(Billed_Amount), Target FROM `master_data` WHERE LOB IN ? AND Branch_Name IN ? group by LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,  Year, month", [[AdminLobArray], [AdminBranchArray], [AdminTerritoryArray]], (error, result) => {
    //                     // if (error) return res.status(401).send("Data not fetched")
    //                     //console.log(brachesssss);
    //                     if (error) return res.send(error)

    //                     res.send(result)
    //                 })

    //             }
    //         })
    //     })
    // })
}