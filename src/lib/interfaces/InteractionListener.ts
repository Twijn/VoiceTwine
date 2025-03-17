import ReplyManager, {TwineInteraction} from "../managers/ReplyManager";

export default interface InteractionListener<T extends TwineInteraction> {
    matches(interaction: T): boolean;
    execute(interaction: T, replyManager: ReplyManager<T>): Promise<void>;
}
