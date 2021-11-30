import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { FormDTO } from './dto/form.dto';
import { FormEntity } from './entity/form.entity';
import { FormDTO } from '@ehpr/common';
import { InjectRepository } from '@nestjs/typeorm';
// import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FormService {
  constructor(
    @InjectRepository(FormEntity)
    private readonly formRepository: Repository<FormEntity>,
  ) {}
  async saveForm(dto: FormDTO) {
    const newForm = this.formRepository.create(dto);
    return await this.formRepository.save(newForm);
  }
  async getForms(): Promise<any> {
    return await this.formRepository.find();
  }
  async getFormById(id: number): Promise<any> {
    // return (await this.formRepository.findByIds([id]))[0];
  }
}
