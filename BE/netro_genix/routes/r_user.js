import express from "express"
import db_manager from "../functions/db_manager.js"
import Instance from "../variable/Instance.js"

var router = express.Router()

router.post("/", function (req, res) {
  db_manager.GetUserList(res)
})

// Add User
router.post("/regist_user", async function (req, res) {
  var userID = req.body.ID
  var userPW = req.body.PW
  var userNickname = req.body.NICKNAME
  var userRole = req.body.ROLE

  const decryptID = db_manager.DecryptionString(userID)
  const decryptPW = db_manager.DecryptionString(userPW)
  const decryptRole = db_manager.DecryptionString(userRole)

  //console.log("regist : " + userID);
  if (
    (await Instance.accountCheck(decryptID, decryptPW)) &&
    (await Instance.nickNameCheck(userNickname))
  ) {
    db_manager.RegistUSER(decryptID, decryptPW, userNickname, decryptRole, res)
  } else {
    res.status(400).send("잘못된 정보를 입력하셨습니다.")
  }
})

// CHECK DUPLICATION ID
router.post("/check_dup", async function (req, res) {
  var userID = req.body.ID
  console.log("check_dup : " + userID)
  if (await Instance.IDCheck(userID)) {
    db_manager.CheckDuplication(userID, res)
  } else {
    res.status(400).send("잘못된 아이디를 입력하셨습니다.")
  }
})

// MODIFY USER
router.post("/modify_myinfo", async function (req, res) {
  //console.log("123");
  var userID = req.body.ID
  var userCUR_PW = req.body.CPW
  var userNEW_PW = req.body.NPW
  var userNickname = req.body.NICKNAME

  const decryptCurPW = db_manager.DecryptionString(userCUR_PW)
  const decryptNewPW = db_manager.DecryptionString(userNEW_PW)

  //console.log(`userID : ${userID} / userCUR_PW : ${decryptCurPW} / userNEW_PW : ${decryptNewPW} / userNickname : ${userNickname} / `);
  if (
    (await Instance.accountCheck(userID, decryptCurPW)) &&
    (await Instance.nickNameCheck(userNickname))
  ) {
    db_manager.ModifyMyInfo(
      userID,
      decryptCurPW,
      decryptNewPW,
      userNickname,
      res
    )
  } else {
    res.status(400).send("잘못된 정보를 입력하셨습니다.")
  }
})

// MODIFY ROLE
router.post("/modifyrole_user", function (req, res) {
  var userID = req.body.ID
  var userROLE = req.body.ROLE

  db_manager.ModifyRole(userID, userROLE, res)
})

// DELETE USER
router.post("/unregist_user", function (req, res) {
  var userID = req.body.ID
  const decryptID = db_manager.DecryptionString(userID)

  console.log("userID = " + decryptID)
  db_manager.DeleteUser(decryptID, res)
})

// CHANGE PASSWORD
router.post("/changePassword", function (req, res) {
  var userID = req.body.ID
  var userPW = req.body.PW
  const decryptID = db_manager.DecryptionString(userID)
  const decryptPW = db_manager.DecryptionString(userPW)
  // console.log(`userID = ${decryptID} / userPW = ${decryptPW}`);
  db_manager.ChangePassword(decryptID, decryptPW, res)
})

//// SAMPLE
// router.post('/', function (req, res) {
// var userID = req.body.ID;
// var userPW = req.body.PW;
// });

module.exports = router
