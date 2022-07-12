export interface IgMediaItem {
    display_url: string
    is_video: boolean
    video_url?: string
}

export interface IgApiItem extends IgMediaItem {
    edge_sidecar_to_children?: {
        edges: {
            node: IgMediaItem
        }[]
    }
}

export interface IgApiData {
    graphql: {
        shortcode_media: IgApiItem
    }
}
