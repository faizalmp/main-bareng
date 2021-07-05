import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserValidator from 'App/Validators/UserValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
import OtpCode from 'App/Models/OtpCode'
import OtpValidator from 'App/Validators/OtpValidator'

export default class AuthController {
    
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
