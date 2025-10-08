import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  column: string;

  @IsNumber()
  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  boardId?: string;
}

export class MoveCardDto {
  @IsString()
  @IsNotEmpty()
  column: string;

  @IsNumber()
  @IsNotEmpty()
  position: number;
}

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  column?: string;

  @IsNumber()
  @IsOptional()
  position?: number;
}