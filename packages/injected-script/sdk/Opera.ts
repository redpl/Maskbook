import { InjectedProvider } from './Base'

export class OperaProvider extends InjectedProvider {
    constructor() {
        super('ethereum')
    }

    override async untilAvailable(): Promise<void> {
        await super.untilAvailable(() => super.getProperty('isOpera') as Promise<boolean>)
    }
}
