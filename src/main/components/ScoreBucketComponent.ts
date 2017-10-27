import { BaseComponent } from "../../pauper/entity-component/component-base.type";

export type ScoreBucketComponent = BaseComponent<"ScoreBucketComponent", { readonly value: number }>;

export const ScoreBucketComponent =
	(value: number): ScoreBucketComponent => BaseComponent("ScoreBucketComponent", { value });
