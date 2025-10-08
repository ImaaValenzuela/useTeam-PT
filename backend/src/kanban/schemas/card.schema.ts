import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true })
  column: string;

  @Prop({ required: true, default: 0 })
  position: number;

  @Prop({ default: 'default' })
  boardId: string;

  // Timestamps automáticos: createdAt y updatedAt
  createdAt?: Date;
  updatedAt?: Date;
}

export const CardSchema = SchemaFactory.createForClass(Card);