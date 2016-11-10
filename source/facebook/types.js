// @flow

/** A structre used for triggering quick replies */
export interface QuickReply {
  content_type: "text",
  title: string,
  payload?: string
}

/** Button for attaching to images */
export interface FBButton {
  type: "web_url" | "postback",
  title: string,
  url?: ?string,
  payload?: ?string
}

export interface GenericElement {
  title: string,
  subtitle: string,
  item_url: string,
  image_url: string,
  buttons?: Array<FBButton>
}
