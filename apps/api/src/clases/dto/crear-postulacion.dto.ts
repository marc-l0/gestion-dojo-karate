import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

const limpiar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const limpiarCorreo = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CrearPostulacionDto {
  @IsInt({ message: 'Selecciona una clase válida.' })
  @Min(1, { message: 'Selecciona una clase válida.' })
  claseId: number;

  @Transform(limpiar)
  @IsString()
  @Length(3, 120, { message: 'El nombre debe tener entre 3 y 120 caracteres.' })
  nombre: string;

  @Transform(limpiar)
  @Matches(/^\d{9}$/, { message: 'El teléfono debe tener 9 dígitos.' })
  telefono: string;

  @Transform(limpiarCorreo)
  @IsEmail({}, { message: 'Escribe un correo electrónico válido.' })
  @MaxLength(254)
  correo: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener el formato AAAA-MM-DD.' })
  @IsDateString({ strict: true }, { message: 'Escribe una fecha de nacimiento válida.' })
  fechaNacimiento: string;

  @IsOptional()
  @Transform(limpiar)
  @IsString()
  @Length(3, 120, { message: 'El nombre del apoderado debe tener entre 3 y 120 caracteres.' })
  nombreCompletoApoderado?: string;

  @IsOptional()
  @Transform(limpiarCorreo)
  @IsEmail({}, { message: 'Escribe un correo válido para el apoderado.' })
  @MaxLength(254)
  correoApoderado?: string;

  @IsOptional()
  @Transform(limpiar)
  @Matches(/^\d{9}$/, { message: 'El teléfono del apoderado debe tener 9 dígitos.' })
  telefonoApoderado?: string;

  @IsBoolean()
  @Equals(true, { message: 'Debes autorizar el uso de tus datos para gestionar la postulación.' })
  consentimiento: boolean;
}
