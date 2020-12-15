const express = require('express')
const db = require('../lib/db')

const router = express.Router();

router.get('/', async (req, res) => {
  let page = 1
  if (req.query.page && req.query.page > 0) page = req.query.page
  let postsArray = []

  try {
    const posts = await db.collection('posts').orderBy('date', 'desc').offset(10 * (page - 1)).limit(10).get()
    posts.forEach(doc => {
      let post = doc.data()
      post.id = doc.id
      postsArray.push(post)
    })
  } catch (e) {
    return res.status(500).send({ status: 'error', msg: 'Posts could not be listed!', error: e })
  }

  if (postsArray.length === 0) {
    return res.status(500).send({ status: 'error', msg: 'A página que está tentando ser encontrada não existe' })
  } else {
    return res.status(200).send({ status: 'OK', quantity: postsArray.length, data: postsArray })
  }
})

router.get('/findpost/:id', async (req, res) => {
  let { id } = req.params
  let post = {}
  try {
    post = (await db.collection('posts').doc(id).get()).data()
    post.id = id
  } catch (e) {
    return res.status(500).send({ status: 'error', msg: 'Post could not be read or does not exist!', error: e })
  }

  return res.status(200).send({ status: 'OK', data: post })
})

router.get('/size', async (req, res) => {
  db.collection('posts').get().then(snap => {
    res.status(200).send({ length: snap.size });
  });
})

router.get('/allpostsdate', async (req, res) => {
  let postsArray = []
  const posts = await db.collection('posts').orderBy('date', 'desc').get()
  posts.forEach(doc => {
    let post = doc.data()
    post.id = doc.id
    postsArray.push(post)
  })

  postsArray = postsArray.map(post => {
    return { id: post.id, name: `${new Date(post.date).getFullYear()}-${new Date(post.date).getMonth()+1}-${new Date(post.date).getDate()} ${new Date(post.date).getHours()}:${new Date(post.date).getMinutes()}:${new Date(post.date).getSeconds()}`}
  })

  return res.status(200).send(postsArray);
})

router.post('/', async (req, res) => {
  let { title, imageURL, description, userid } = req.body
  let postID = ''
  try {

    const dateStamp = new Date().getTime()
    const doc = db.collection('posts').doc()

    postID = doc._path.segments[1]

    doc.set({ title, imageURL, description, date: dateStamp, userid })
      .then((snap) => {
        console.log('Post created!')
      })
  } catch (e) {
    return res.status(500).send({ status: 'error', msg: 'Post could not be created!', error: e })
  }

  return res.status(200).send({ status: 'OK', id: postID })
})

router.put('/', async (req, res) => {
  let { title, imageURL, description, postid } = req.body
  let post = {}
  try {

    db.collection('posts').doc(postid)
      .update({ title, imageURL, description })

    post = (await db.collection('posts').doc(postid).get()).data()
    post.id = postid

  } catch (e) {
    return res.status(500).send({ status: 'error', msg: 'Post could not be updated!', error: e })
  }

  return res.status(200).send({ status: 'OK', data: post })
})

router.delete('/', (req, res) => {
  let { postid } = req.body

  try {
    db.collection('posts').doc(postid).delete()
    return res.status(200).send({ status: 'OK', msg: 'Post deleted!' })
  } catch (e) {
    return res.status(500).send({ error: 'Post could not be deleted!', error: e })
  }
})


module.exports = router;