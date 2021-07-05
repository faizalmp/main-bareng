import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Booking from 'App/Models/Booking'
import Field from 'App/Models/Field'
import User from 'App/Models/User'
import BookingValidator from 'App/Validators/BookingValidator'

export default class BookingsController {

/**
  * @swagger
  * /api/v1/bookings:
  *   get:
  *     security:
  *       - bearerAuth: []
  *     tags:
  *       - Bookings
  *     summary: Get All Bookings
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/

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

/**
  * @swagger
  * /api/v1/venues/{id}/bookings:
  *   post:
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: number
  *           minimum: 1
  *         description: Field ID
  *     tags:
  *       - Venues
  *     summary: Create Booking
  *     requestBody:
  *       required: true
  *       content:
  *         application/x-www-form-urlencoded:
  *           schema:
  *             $ref: '#definitions/Booking'
  *         application/json:
  *           schema:
  *             $ref: '#definitions/Booking'
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/

    public async store({ request, response, params, auth }: HttpContextContract) {
        try {
            let { id } = params
            const payload = await request.validate(BookingValidator)

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

/**
  * @swagger
  * /api/v1/bookings/{id}:
  *   get:
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: number
  *           minimum: 1
  *         description: Booking ID
  *     tags:
  *       - Bookings
  *     summary: Get Booking by Id
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/

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

/**
  * @swagger
  * /api/v1/schedules:
  *   get:
  *     security:
  *       - bearerAuth: []
  *     tags:
  *       - Bookings
  *     summary: Get Current User Schedule
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/

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

/**
  * @swagger
  * /api/v1/bookings/{id}/join:
  *   put:
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: number
  *           minimum: 1
  *         description: Booking ID
  *     tags:
  *       - Bookings
  *     summary: Join Booking
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/    

    public async join({ auth, response, params }: HttpContextContract) {
        let { id } = params
        const user = auth.user

        await user?.related('bookings').sync([id])

        return response.ok({ message: 'Success' })
    }

/**
  * @swagger
  * /api/v1/bookings/{id}/unjoin:
  *   put:
  *     security:
  *       - bearerAuth: []
  *     parameters:
  *       - in: path
  *         name: id
  *         required: true
  *         schema:
  *           type: number
  *           minimum: 1
  *         description: Booking ID
  *     tags:
  *       - Bookings
  *     summary: Unjoin Booking
  *     responses:
  *       '200':
  *         description: Success
  *       '400':
  *         description: Failed
  *       '401':
  *         description: Unauthorized
  *       '500':
  *         description: Internal Server Error
*/ 

    public async unjoin({ auth, response, params }: HttpContextContract) {
        let { id } = params
        const user = auth.user

        await user?.related('bookings').detach([id])

        return response.ok({ message: 'Success' })
    }
}
