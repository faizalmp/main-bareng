import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserValidator from 'App/Validators/UserValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
import OtpCode from 'App/Models/OtpCode'
import OtpValidator from 'App/Validators/OtpValidator'

export default class AuthController {

/**
  * @swagger
  * /api/v1/register:
  *   post:
  *     tags:
  *       - Auth
  *     summary: Register
  *     requestBody:
  *       required: true
  *       content:
  *         application/x-www-form-urlencoded:
  *           schema:
  *             $ref: '#definitions/User'
  *         application/json:
  *           schema:
  *             $ref: '#definitions/User'
  *     responses:
  *       '201':
  *         description: Register success!
  *       '422':
  *         description: Register failed!
*/
    
    public async register({ request, response }: HttpContextContract) {
        try {
            let payload = await request.validate(UserValidator)
            
            if (!payload.role) {
                payload.role = 'user'
            }

            const newUser = await User.create(payload)

            const otp_code = Math.floor(100000 + Math.random() * 900000)
            const otp = new OtpCode()
            otp.otpCode = otp_code
            otp.userId = newUser.id
            await otp.save()

            await Mail.send((message) => {
                message
                    .from("admin@mainbareng.com")
                    .to(payload.email)
                    .subject('OTP Verification')
                    .htmlView('emails/otp_verification', { otp_code })
            })

            return response.created({ message: 'Success', data: newUser })
        } catch (error) {
            console.log(error)
            return response.unprocessableEntity({ message: error.messages })
        }
    }

/**
  * @swagger
  * /api/v1/login:
  *   post:
  *     tags:
  *       - Auth
  *     summary: Login
  *     requestBody:
  *       required: true
  *       content:
  *         application/x-www-form-urlencoded:
  *           schema:
  *             type: object
  *             properties:
  *               email:
  *                 type: string
  *               password:
  *                 type: string
  *             required:
  *               - email
  *               - password
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               email:
  *                 type: string
  *               password:
  *                 type: string
  *             required:
  *               - email
  *               - password
  *     responses:
  *       '200':
  *         description: Login success!
  *       '400':
  *         description: Login failed!
*/

    public async login({ request, response, auth }: HttpContextContract) {
       try {
        const payload = await request.validate(LoginValidator)

        const token = await auth.use('api').attempt(payload.email, payload.password)

        const user = await User.findBy('email', payload.email)
 
        return response.ok({ message: 'Success', token, user: user })
       } catch (error) {
           if (error.guard) {
            return response.badRequest({ message: error.message })
           } else {
            return response.badRequest({ message: error.messages })
           }
       }
    }


/**
  * @swagger
  * /api/v1/otp-confirmation:
  *   post:
  *     tags:
  *       - Auth
  *     summary: OTP Confirmation
  *     requestBody:
  *       required: true
  *       content:
  *         application/x-www-form-urlencoded:
  *           schema:
  *             type: object
  *             properties:
  *               otp_code:
  *                 type: number
  *               email:
  *                 type: string
  *             required:
  *               - otp_code
  *               - email
  *         application/json:
  *           schema:
  *             type: object
  *             properties:
  *               otp_code:
  *                 type: number
  *               email:
  *                 type: string
  *             required:
  *               - otp_code
  *               - email
  *     responses:
  *       '200':
  *         description: Otp success!
  *       '400':
  *         description: Otp failed!
*/

    public async otp({ request, response }: HttpContextContract) {
        let payload = await request.validate(OtpValidator)

        let user = await User.findBy('email', payload.email)
        let otp = await OtpCode.findBy('otp_code', payload.otp_code)

        if(user?.id == otp?.userId) {
            if(user) {
                user.isVerified = true
                await user.save()
            }

            return response.ok({ message: 'Confirmed!' })
        } else {
            return response.badRequest({ message: 'Failed to confirm OTP' })
        }
    }
}
