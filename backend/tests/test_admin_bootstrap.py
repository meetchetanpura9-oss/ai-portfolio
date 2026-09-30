import os
import unittest
from unittest.mock import Mock, patch

import jwt

from app.services import auth_service
from app.core.config import Settings
from app.services.admin_bootstrap import create_admin_if_configured


class AdminBootstrapTests(unittest.TestCase):
    def test_admin_password_has_no_default_and_loads_when_configured(self):
        with patch.dict(os.environ, {}, clear=True):
            self.assertIsNone(Settings(_env_file=None).ADMIN_PASSWORD)

        with patch.dict(os.environ, {"ADMIN_PASSWORD": "test-only-credential"}):
            configured = Settings(_env_file=None).ADMIN_PASSWORD
            self.assertIsNotNone(configured)
            self.assertEqual(configured.get_secret_value(), "test-only-credential")

    def test_missing_password_skips_admin_setup_without_opening_session(self):
        session_factory = Mock()

        for password in (None, "", "   "):
            with self.subTest(password_configured=bool(password and password.strip())):
                with self.assertLogs(level="INFO") as captured:
                    created = create_admin_if_configured(
                        session_factory,
                        email="owner@example.test",
                        name="Owner",
                        password=password,
                    )
                self.assertFalse(created)
                self.assertIn("Admin setup skipped", captured.output[0])

        session_factory.assert_not_called()

    def test_placeholder_email_skips_admin_setup(self):
        session_factory = Mock()
        created = create_admin_if_configured(
            session_factory,
            email="admin@example.com",
            name="Owner",
            password="test-only-credential",
        )
        self.assertFalse(created)
        session_factory.assert_not_called()

    def test_admin_creation_hashes_password_without_logging_it(self):
        credential = "test-only-credential"
        session = Mock()
        session.query.return_value.count.return_value = 0

        with patch("app.services.admin_bootstrap.hash_password", return_value="test-hash") as hash_password:
            with self.assertLogs(level="INFO") as captured:
                created = create_admin_if_configured(
                    lambda: session,
                    email="OWNER@example.test",
                    name="Owner",
                    password=credential,
                )

        self.assertTrue(created)
        hash_password.assert_called_once_with(credential)
        account = session.add.call_args.args[0]
        self.assertEqual(account.email, "owner@example.test")
        self.assertEqual(account.hashed_password, "test-hash")
        session.commit.assert_called_once()
        session.close.assert_called_once()
        self.assertNotIn(credential, " ".join(captured.output))
        self.assertNotIn("test-hash", " ".join(captured.output))

    def test_setup_failure_does_not_log_exception_details(self):
        credential = "test-only-credential"
        session = Mock()
        session.query.side_effect = RuntimeError(credential)

        with self.assertLogs(level="ERROR") as captured:
            created = create_admin_if_configured(
                lambda: session,
                email="owner@example.test",
                name="Owner",
                password=credential,
            )

        self.assertFalse(created)
        session.rollback.assert_called_once()
        session.close.assert_called_once()
        self.assertNotIn(credential, " ".join(captured.output))

    def test_authentication_errors_do_not_log_credentials(self):
        credential = "test-only-credential"

        with patch.object(auth_service.bcrypt, "checkpw", side_effect=ValueError(credential)):
            with patch.object(auth_service.jwt, "decode", side_effect=jwt.InvalidTokenError(credential)):
                with self.assertLogs(auth_service.logger, level="DEBUG") as captured:
                    self.assertFalse(auth_service.verify_password(credential, "test-hash"))
                    self.assertIsNone(auth_service.decode_access_token(credential))

        self.assertNotIn(credential, " ".join(captured.output))


if __name__ == "__main__":
    unittest.main()
