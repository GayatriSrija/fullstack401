const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

const app = express();
const port = 5000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://movies-ea4c4.firebaseio.com" // Replace with your actual database URL
});

const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve login and signup pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    await db.collection('users').add({
      username,
      email,
      password: hashedPassword, // Store the hashed password
    });
    res.redirect('/');
  } catch (error) {
    console.error('Error adding document: ', error);
    res.send('Error registering user');
  }
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userSnapshot = await db.collection('users').where('username', '==', username).get();
    if (userSnapshot.empty) {
      res.send('Invalid username or password');
    } else {
      const user = userSnapshot.docs[0].data();
      const passwordMatch = await bcrypt.compare(password, user.password); // Compare the hashed password
      if (passwordMatch) {
        res.redirect('/movies.html');
      } else {
        res.send('Invalid username or password');
      }
    }
  } catch (error) {
    console.error('Error retrieving document: ', error);
    res.send('Error logging in');
  }
});

// Handle movie details saving
app.post('/save-movie', async (req, res) => {
  const movieDetails = req.body;
  try {
    await db.collection('movies').add(movieDetails);
    res.json({ message: 'Movie details saved successfully' });
  } catch (error) {
    console.error('Error saving movie details: ', error);
    res.status(500).json({ message: 'Error saving movie details' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
