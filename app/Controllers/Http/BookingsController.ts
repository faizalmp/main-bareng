import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Booking from 'App/Models/Booking'
import Field from 'App/Models/Field'
import User from 'App/Models/User'
import BookingValidator from 'App/Validators/BookingValidator'

export default class BookingsController {

    public async index({ response }: HttpContextContract) {
        let fields = await Booking.query().preload('field', (query) => {
            query.select('id', 'name', 'type')
        }).preload('user', (query) => {
            query.select('id', 'name')
        })
        if (fields) {
            return response.ok({ message: 'Success', data: fields })
        }
        return response.badRequest({ message: 'No data' })
    }

    public async store({ request, response, params, auth }: HttpContextContract) {
        try {
            let { id } = params
            const payload = await request.validate(BookingValidator)
            if(!payload)
                return response.badRequest({ message: 'No such data to update' })

            let booking = new Booking()
            booking.playDateStart = request.input('play_date_start')
            if (request.input('play_date_end')) {
                booking.playDateEnd = request.input('play_date_end')
            }

            const field = await Field.findOrFail(id)
            booking.fieldId = field.id

            const user = auth.user

            if (user) booking.userId = user.id

            await field.related('bookings').save(booking)
            return response.created({ message: 'Success', data: booking })
        } catch (error) {
            return response.badRequest({ errors: error.messages })
        }
    }

    public async show({ params, response }: HttpContextContract) {
        let { id } = params
        let booking = await Booking.findBy("id", id)
        if (booking) {
            return response.ok({ message: 'Success', data: booking })
        }
        return response.badRequest({ message: 'No such data to show' })
    }

    public async update({ params, request, response }: HttpContextContract) {
        const payload = await request.validate(BookingValidator)
        if(!payload)
            return response.badRequest({ message: 'No such data to update' })
        let { id } = params

        let booking = await Booking.findOrFail(id)
        booking.playDateStart = request.input('play_date_start')
        if (request.input('play_date_end')) {
            booking.playDateEnd = request.input('play_date_end')
        }

        await booking.save()
        if (booking) {
            return response.ok({ message: 'Updated!', data: booking })
        }
        return response.badRequest({ message: 'No such data to update' })
    }

    public async destroy({ params, response }: HttpContextContract) {
        let { id } = params
        let venue = await Booking.findOrFail(id)
        await venue.delete()
        if (venue) {
            return response.ok({ message: 'Deleted!' })
        }
        return response.badRequest({ message: 'No such data to delete' })
    }

    public async schedule({ response, auth }: HttpContextContract) {
        const user = auth.user
        if (user) {
            let bookings = await User.query().preload('bookings').where('id', user.id)
            if (bookings) {
                return response.ok({ message: 'Success', data: bookings })
            }
        }
        return response.badRequest({ message: 'No such data to show' })
    }    

    public async join({ auth, response, params }: HttpContextContract) {
        let { id } = params
        const user = auth.user

        await user?.related('bookings').sync([id])

        return response.ok({ message: 'Success' })
    }

    public async unjoin({ auth, response, params }: HttpContextContract) {
        let { id } = params
        const user = auth.user

        await user?.related('bookings').detach([id])

        return response.ok({ message: 'Success' })
    }
}
