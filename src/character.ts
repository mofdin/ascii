import { potion, type Item } from '@/item'
import { print } from '@/utils'

export class Character {
  name: string
  hp: number
  hp_max: number
  damage: number
  gold: number = 0

  x: number = 0
  y: number = 0

  inventory: Item[] = []

  constructor(name: string, hp: number, damage: number) {
    this.name = name
    this.hp = hp
    this.hp_max = hp
    this.damage = damage

    this.inventory.push(potion)
  }

  attack(target: Character): void {
    target.hp -= this.damage
    target.hp = Math.max(0, target.hp)

    print(`${this.name} dealt ${this.damage} damage to ${target.name}!`)
  }

  isAlive(): boolean {
    return this.hp > 0
  }

  useItem(item: Item): void {
    const index = this.inventory.indexOf(item)

    if (index !== -1) {
      this.inventory.splice(index, 1)
    }
  }
}
