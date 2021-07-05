import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Venue from './Venue'
import Booking from './Booking'

/** 
*  @swagger
*  definitions:
*    Field:
*      type: object
*      properties:
*        id:
*          type: uint
*        name:
*          type: string
*        type:
*          type: string
*        venue_id:
*          type: number
*      required:
*        - name
*        - type
*        - venue_id
*/

export default class Field extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public type: string

  @column({ columnName: 'venues_id' })
  public venueId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Venue)
  public venue: BelongsTo<typeof Venue>

  @hasMany(() => Booking)
  public bookings: HasMany<typeof Booking>
}
