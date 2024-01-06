export interface IConfigItem {
    id: string,
    type: string,
    props: {
        text: string,
        message: string
    }
}

export type IConfigs = Array<IConfigItem>