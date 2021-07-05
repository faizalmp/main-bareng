import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Field from 'App/Models/Field'
import Venue from 'App/Models/Venue'
import FieldValidator from 'App/Validators/FieldValidator'

export default class FieldsController {
    public async index({ response }: HttpContextContract) {
        let fields = await Field.query().preload('venue', (query) => {
            query.select('id', 'name')
        }).preload('bookings', (query) => {
            query.select('id', 'play_date_start', 'play_date_end', 'user_id_booking', 'fields_id')
        })
        if (fields) {
            return response.ok({ message: 'Success', data: fields })   
        }
        return response.badRequest({ message: 'No data' })
    }

    public async store({ request, response, params }: HttpContextContract) {
        try {
            let { id } = params
            const payload = await request.validate(FieldValidator)

            let field = new Field()
            field.name = payload.name
            if (payload.type) {
                field.type = payload.type
            }

            const venue = await Venue.findOrFail(id)

            await venue.related('fields').save(field)
            return response.created({ message: 'Success', data: field })
        } catch (error) {
            console.log(error)
            return response.badRequest({ errors: error.messages })
        }
    }

    public async show({ params, response }: HttpContextContract) {
        let { id } = params
        let field = await Field.findBy("id", id)
        if (field) {
            return response.ok({ message: 'Success', data: field })   
        }
        return response.badRequest({ message: 'No such data to show' })
    }

    public async update({ params, request, response }: HttpContextContract) {
        const payload = await request.validate(FieldValidator)
        let { id } = params

        let field = await Field.findOrFail(id)
        field.name = payload.name
        if (payload.type) {
            field.type = payload.type
        }

        await field.save()
        if (field) {
            return response.ok({ message: 'Updated!', data: field})
        }
        return response.badRequest({ message: 'No such data to update' })
    }

    public async destroy({ params, response }: HttpContextContract) {
        let { id } = params
        let venue = await Venue.findOrFail(id)
        await venue.delete()
        if (venue) {
            return response.ok({ message: 'Deleted!'})
        }
        return response.badRequest({ message: 'No such data to delete' })
    }
}
