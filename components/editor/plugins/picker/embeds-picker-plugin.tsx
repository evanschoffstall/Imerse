
// import {
//   CustomEmbedConfig,
//   EmbedConfigs,
// } from "@/components/editor/plugins/embeds/auto-embed-plugin"

export function EmbedsPickerPlugin({
  embed,
}: {
  embed: "tweet" | "youtube-video"
}) {
  // TODO: Uncomment when auto-embed-plugin is implemented
  // const embedConfig = EmbedConfigs.find(
  //   (config: any) => config.type === embed
  // ) as CustomEmbedConfig

  // return new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
  //   icon: embedConfig.icon,
  //   keywords: [...embedConfig.keywords, "embed"],
  //   onSelect: (_, editor) =>
  //     editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type),
  // })
  return null as any
}
