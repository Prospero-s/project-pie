<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250318171914 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE notifications ADD deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('COMMENT ON COLUMN notifications.deleted_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE user_notifications ADD notification_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user_notifications DROP deleted_at');
        $this->addSql('ALTER TABLE user_notifications ADD CONSTRAINT FK_8E8E1D83EF1A9D84 FOREIGN KEY (notification_id) REFERENCES notifications (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_8E8E1D83EF1A9D84 ON user_notifications (notification_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_notifications DROP CONSTRAINT FK_8E8E1D83EF1A9D84');
        $this->addSql('DROP INDEX IDX_8E8E1D83EF1A9D84');
        $this->addSql('ALTER TABLE user_notifications ADD deleted_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
        $this->addSql('ALTER TABLE user_notifications DROP notification_id');
        $this->addSql('ALTER TABLE notifications DROP deleted_at');
    }
}
