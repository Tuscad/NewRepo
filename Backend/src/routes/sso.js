const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password, region = 'pl' } = req.body;

  try {
    const response = await axios.post(
      `https://endpoint.sfgame.net/${region}/login`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = response.data;

    res.json({
      ssoKey: data.key,
      world: data.world,
      character: data.character,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({
      error: 'SSO login failed',
      message: err.response?.data || err.message,
    });
  }
});

module.exports = router;
