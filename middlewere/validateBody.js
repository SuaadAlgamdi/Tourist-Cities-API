const validateBody = elementJoi => {
  return async (req, res, next) => {
    try {
      const result = elementJoi.validate(req.body) //  استقبل الحركة cityEditJoi becues it is(hight orderfunction)عشان الجوي هو الي يتغير محتاج نسوي هذي الحركه

      if (result.error) return res.status(400).send(result.error.details[0].message)
      next()
    } catch (error) {
      res.status(500).send(error.message)
    }
  }
}
module.exports = validateBody
