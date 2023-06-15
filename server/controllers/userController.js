const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { User, Basket } = require('../models/models')


// передаем с генерацией токена роль пользователя
const generateJwt = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.SECRET_KEY,
    { expiresIn: '24h' } // время жизни токена
  )
}

class UserController {
  async registration(req, res, next) {
    const { email, password, role } = req.body
    if (!email || !password) {
      return next(ApiError.badRequest('Некорректный email или password'))
    }

    // Проверка пользователя с таким же email
    const candidate = await User.findOne({ where: { email } })
    if (candidate) {
      return next(ApiError.badRequest('Пользователь с таким email уже существует'))
    }
    // шифруем пароль (передаем паспорт и кол-во раз хешировать)
    const hashPassword = await bcrypt.hash(password, 5)
    // создаем пользователя
    const user = await User.create({ email, role, password: hashPassword })
    // Создаем корзину для пользователя
    const basket = await Basket.create({ userId: user.id })
    // генерация токена
    const token = generateJwt(user.id, user.email, user.role)
    return res.json({ token })
  }

  async login(req, res, next) {
    const {email, password} = req.body
    const user = await User.findOne({where: {email}})
    if (!user) {
      return next(ApiError.internal('Пользователь с таким именем не найден'))
    }

    // сравниваем введенный пароль
    let comparePassword = bcrypt.compareSync(password, user.password)
    if (!comparePassword) {
      return next(ApiError.badRequest('Некорректный email или password'))
    }
    // генерируем token
    const token = generateJwt(user.id, user.email, user.role)
    return res.json({ token })
  }

  async check(req, res, next) {
    const token = generateJwt(req.user.id, req.user.email, req.user.role)
    res.json({token})
  }
}

module.exports = new UserController()