import { authenticator as otplibAuthenticator } from "otplib";

type TotpAuthenticator = {
	generateSecret(numberOfBytes?: number): string;
	generate(secret: string): string;
	verify(options: { token: string; secret: string }): boolean;
};

export class TwoFactorService {
	readonly authenticator: TotpAuthenticator = otplibAuthenticator.clone({
		window: 1,
	});

	generateSecret(): string {
		return this.authenticator.generateSecret();
	}

	generateToken(secret: string): string {
		return this.authenticator.generate(secret);
	}

	verifyToken(token: string, secret: string): boolean {
		return this.authenticator.verify({ token, secret });
	}
}
