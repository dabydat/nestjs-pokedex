import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon as IPokemon } from 'src/pokemon/interfaces/pokemon.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  private pokemonData: IPokemon[] = [];
  constructor(
    @InjectModel(Pokemon.name) 
    readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ) { }

  async executeSeed() {
    await this.pokemonModel.deleteMany({});
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      this.pokemonData.push({ no, name });
    });

    await this.pokemonModel.insertMany(this.pokemonData)
    return 'Seed has been executed successfully!'
  }
}
