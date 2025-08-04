<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250316022042 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE notifications_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE user_notifications_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE notification_settings_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE notifications (id INT NOT NULL, type VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, message TEXT NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('COMMENT ON COLUMN notifications.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE user_notifications (id INT NOT NULL, user_id_id INT DEFAULT NULL, received_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, read_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,  status VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_8E8E1D839D86650F ON user_notifications (user_id_id)');
        $this->addSql('COMMENT ON COLUMN user_notifications.received_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE TABLE notification_settings (id INT NOT NULL, user_id_id INT NOT NULL, email_enabled BOOLEAN NOT NULL, sms_enabled BOOLEAN NOT NULL, push_enabled BOOLEAN NOT NULL, updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B05598609D86650F ON notification_settings (user_id_id)');
        $this->addSql('ALTER TABLE user_notifications ADD CONSTRAINT FK_8E8E1D839D86650F FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE notification_settings ADD CONSTRAINT FK_B05598609D86650F FOREIGN KEY (user_id_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP SEQUENCE notifications_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE user_notifications_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE notification_settings_id_seq CASCADE');
        $this->addSql('ALTER TABLE user_notifications DROP CONSTRAINT FK_8E8E1D839D86650F');
        $this->addSql('ALTER TABLE notification_settings DROP CONSTRAINT FK_B05598609D86650F');
        $this->addSql('DROP TABLE notifications');
        $this->addSql('DROP TABLE user_notifications');
        $this->addSql('DROP TABLE notification_settings');
    }
}
