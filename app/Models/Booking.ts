import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Field from './Field'

/** 
*  @swagger
*  definitions:
*    Booking:
*      type: object
*      properties:
*        play_date_start:
*          type: datetime
*        play_date_end:
*          type: datetime
*      required:
*        - play_date_start
*/

export default class Booking extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ columnName: 'play_date_start' })
  public playDateStart: DateTime

  @column({ columnName: 'play_date_end' })
  public playDateEnd: DateTime

  @column({ columnName: 'user_id_booking' })
  public userId: number

  @column({ columnName: 'fields_id' })
  public fieldId: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Field)
  public field: BelongsTo<typeof Field>

  @hasMany(() => Booking)
  public bookings: HasMany<typeof Booking>

  @manyToMany(() => User)
  public players: ManyToMany<typeof User>
}
