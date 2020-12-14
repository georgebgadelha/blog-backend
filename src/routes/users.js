const express = require('express')
const db = require('../lib/db')
const { generatePassword } = require('../lib/utils')

const router = express.Router();

router.get('/', async (req, res) => {
  let usersArray = []
 
  try {
    const users = await db.collection('users').get()
    users.forEach(doc => {
      let user = doc.data()
      user.id = doc.id
      usersArray.push(user)
    })
  } catch (e) {
    return res.status(500).send({ status: 'error', msg: 'Users could not be listed!', error: e})
  }

  return res.status(200).send({ status: 'OK', data: usersArray})
})

router.get('/:id', async (req, res) => {
  let { id } = req.params
  let user = {}
  try{
    user = (await db.collection('users').doc(id).get()).data()
    user.id = id  
  } catch (e) {
    return res.status(500).send({ status: 'error', msg: 'User could not be read or does not exist!', error: e})
  }

  return res.status(200).send({status: 'OK', data: user})
})

router.post('/', async (req, res) => {
  let { fullname, email, phone } = req.body
  let userID = ''

  try{
    const doc = db.collection('users').doc()
    const password = generatePassword()
  
    userID = doc._path.segments[1]
  
    doc.set({ fullname, email, password, phone})
    .then((snap) => {
      console.log('User created!')
    })
  } catch (e) {
    return res.status(500).send({ status: 'error', msg: 'User could not be created!', error: e})
  }

  return res.status(200).send({ status: 'OK', id: userID})
})

router.put('/', async (req, res) => {
  let { fullname, email, password, phone, userid } = req.body
  let user = {}

  try{

    db.collection('users').doc(userid)
    .update({ fullname, email, password, phone })
  
    user = (await db.collection('users').doc(userid).get()).data()
    user.id = userid

  } catch (e) {
    return res.status(500).send({ status: 'error', msg: 'User could not be updated!', error: e})
  }

  return res.status(200).send({status: 'OK', data: user})
})

router.delete('/', (req, res) => {
  let { id } = req.body

  try {
    db.collection('users').doc(id).delete()
    return res.status(200).send({ status: 'OK', msg: 'User deleted!'})
  } catch (e) {
    return res.status(500).send({ error: 'User could not be deleted!', error: e})
  }
})


module.exports = router;