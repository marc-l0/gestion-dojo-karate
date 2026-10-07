import { IsArray, IsDateString, IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CrearClaseDto {
  @IsString()
  @IsNotEmpty()
  nivel: string;

  @IsString()
  @IsNotEmpty()
  sede: string;

  @IsArray()
  @IsString({ each: true })
  frecuencia: string[];

  @IsString()
  @IsNotEmpty()
  profesor: string;

  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @IsString()
  @IsNotEmpty()
  horaFin: string;

  @IsNumber()
  @Min(0)
  tarifa: number;

  @IsNumber()
  @Min(1)
  cupos: number;

  @IsDateString()
  fechaInicio: string;

  @IsString()
  @IsIn(['1 semana', '2 semanas', '3 semanas', '1 mes'])
  duracion: string;
}
