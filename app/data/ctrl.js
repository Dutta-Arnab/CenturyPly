const { con } = require('../../config/db')

module.exports.data = (req, res) => {
    const role = (JSON.parse(res.currentUser.role))
    const lob = (JSON.parse(JSON.parse(res.currentUser.role).lob))
    const branches = (JSON.parse(JSON.parse(res.currentUser.role).branches))
    const lobArray = lob.map(l => l.name)
    const branchArray = branches.map(b => b.name)
    let AdminLobArray,AdminBranchArray;

    con.query("SELECT lob from `lob_master`", (error, result) => {
        if (error) return res.status(401).send("Data not fetched")
        AdminLobArray = result.map(l => l.lob)
        con.query("SELECT name from `branch_master`", (error, result) => {
            if (error) return res.status(401).send("Data not fetched")
            AdminBranchArray = result.map(l => l.name)

            if (role.name !== "Admin" && !AdminLobArray && !AdminBranchArray) {

                con.query("SELECT LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,Billed_Qty_PCs,sum(Billed_Qty_PCs), Billed_Qty_NA,sum(Billed_Qty_NA), DATE_FORMAT(InvoiceDt,'%Y') Year,DATE_FORMAT(InvoiceDt,'%m') month, sum(Billed_Amount) FROM `master_data` WHERE LOB IN ? AND Branch_Name IN ? group by LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,  Year, month", [[lobArray], [branchArray]], (error, result) => {
                    // if (error) return res.status(401).send("Data not fetched")
                    //console.log(brachesssss);
                    if (error) return res.send(error)

                    res.send(result)
                })
            }
            else {
                con.query("SELECT LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,Billed_Qty_PCs,sum(Billed_Qty_PCs), Billed_Qty_NA,sum(Billed_Qty_NA), DATE_FORMAT(InvoiceDt,'%Y') Year,DATE_FORMAT(InvoiceDt,'%m') month, sum(Billed_Amount) FROM `master_data` WHERE LOB IN ? AND Branch_Name IN ? group by LOB, Branch_Name,Prod_Grp1, Prod_Grp2, Prod_Grp3, Prod_Grp4,  Year, month", [[AdminLobArray], [AdminBranchArray]], (error, result) => {
                    // if (error) return res.status(401).send("Data not fetched")
                    //console.log(brachesssss);
                    if (error) return res.send(error)

                    res.send(result)
                })

            }
        })
    })
}