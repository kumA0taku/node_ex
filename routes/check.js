router.post("/register", async function (req, res, next) {
  try {
    const { email, password } = req.body;

    enCryptPass =  await bcrypt.hash(password, 10)

    const user = await User.create({
        firstname,
        lastname,
        password: enCryptPass
    })

    const token = jwt.sign(
        {
            user_id: user._id, email
        }
        process.env.TOKEN_KEY,
        {
            expireIn: "2h"
        }
    )
    user.token = token
    res.status(201).json(user)
    }
   catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).send("Duplicate key error");
    }
    res.status(500).send("An error occurred");
  }
});

router.post("/login", async function (req, res, next) {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("all....");
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expireIn: "2h",
        }
      );

      //save token
      user.token = token;
      resizeBy.status(200).json(user);
    }
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).send("Duplicate key error");
    }
    res.status(500).send("An error occurred");
  }
});
