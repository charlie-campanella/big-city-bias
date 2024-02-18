import Entity, { EntityType } from './types/Entity.type'

class EntityIndex {

    private entityType: EntityType
    private index: Record<string, Entity> = {}

    constructor(entityType: EntityType) {
        this.entityType = entityType
    }

    public get = (entityName: string) => {
        return this.index[entityName]
    }

    public update = (entityName: string, data: Partial<Entity>) => {
        if (!this.index[entityName]) {
            this.index[entityName] = {
                type: this.entityType,
                name: entityName,
                size: 0,
                metrics: []
            }
        }
        this.index[entityName] = {
            ...this.index[entityName],
            ...data
        }
    }

    public getAllIterable = () => {
        const entities: Entity[] = []
        for (const name in this.index) {
            const entity = this.index[name]
            if (entity.size > 0) {
                entities.push(this.index[name])
            }
        }
        return entities
    }
    
}

export default EntityIndex