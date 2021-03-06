import { ApiPromise } from "@polkadot/api";
import { makeFree } from "../crustApi";
import DB from "../db";
import { IPromotionApplicant } from "../db/models/promotionApplicant.model";
import { GithubApplicant } from "./github";

export async function applyByGithub(api: ApiPromise, ghApplicant: GithubApplicant, db: DB) {
    const maybeApplied = await db.maybeExistGithubApplicant(ghApplicant.githubId, ghApplicant.address);
    if (maybeApplied) {
        return {
            ok: false,
            value: "Your github account or address has already been applied"
        }
    } else {
        const txResult = await makeFree(api, ghApplicant.address);
        if (txResult.status) {
            await db.saveGithubApplicant(ghApplicant.githubId, ghApplicant.githubName, ghApplicant.address);
            return {
                ok: true,
                value: "succeed",
            };
        } else {
            return {
                ok: false,
                value: txResult.details,
            };
        }
    }
}

export async function applyByPromotionCode(api: ApiPromise, iPA: IPromotionApplicant, db: DB) {
    const orderCount = await db.usePromotionCode(iPA.code);
    if (orderCount) {
        const result = await makeFree(api, iPA.address, orderCount);
        if (result.status) {
            await db.savePromotionApplicant(iPA.code, iPA.address);
            return {
                ok: true,
                value: "succeed",
            };
        } else {
            await db.promotionRollback(iPA.code);
            return {
                ok: false,
                value: result.details
            }
        }
    }
    return {
        ok: false,
        value: "Invalid promotion code",
    };
}