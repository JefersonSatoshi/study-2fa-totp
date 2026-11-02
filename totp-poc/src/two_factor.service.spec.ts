import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TwoFactorService } from "./two_factor.service";

describe("TwoFactorService", () => {
	let service: TwoFactorService;

	beforeEach(() => {
		service = new TwoFactorService();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should generate a secret", () => {
		const secret1 = service.generateSecret();
		const secret2 = service.generateSecret();

		expect(secret1).toBeDefined();
		expect(secret1).not.toBe("");
		expect(typeof secret1).toBe("string");
		expect(secret1).not.toBe(secret2);
	});

	it("should generate a valid TOTP token", () => {
		const secret = service.generateSecret();
		const token = service.generateToken(secret);

		expect(token).toMatch(/^\d{6}$/);
	});

	it("should accept a valid token", () => {
		const secret = service.generateSecret();
		const token = service.generateToken(secret);

		const result = service.verifyToken(token, secret);

		expect(result).toBe(true);
	});

	it("should reject an invalid token", () => {
		const secret = service.generateSecret();
		const token = "000000";

		const result = service.verifyToken(token, secret);

		expect(result).toBe(false);
	});

	it("should reject an expired token", () => {
		vi.useFakeTimers();

		vi.setSystemTime(new Date("2026-11-02T12:00:00Z"));

		const secret = service.generateSecret();
		const token = service.generateToken(secret);

		vi.setSystemTime(new Date("2026-11-02T12:02:00Z"));

		const result = service.verifyToken(token, secret);

		expect(result).toBe(false);
	});
});
