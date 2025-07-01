<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250130130853 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE group_invitation_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE "user_id_seq" INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE user_group_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE group_invitation (
          id INT NOT NULL,
          group_id INT NOT NULL,
          invited_by_id INT NOT NULL,
          email TEXT NOT NULL,
          token VARCHAR(36) NOT NULL,
          expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_26D000105F37A13B ON group_invitation (token)');
        $this->addSql('CREATE INDEX IDX_26D00010FE54D947 ON group_invitation (group_id)');
        $this->addSql('CREATE INDEX IDX_26D00010A7B4A7E3 ON group_invitation (invited_by_id)');
        $this->addSql('CREATE TABLE "user" (
          id INT NOT NULL,
          user_group_id INT DEFAULT NULL,
          cognito_id VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          roles JSON NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D64982CBE480 ON "user" (cognito_id)');
        $this->addSql('CREATE INDEX IDX_8D93D6491ED93D47 ON "user" (user_group_id)');
        $this->addSql('CREATE TABLE user_group (
          id INT NOT NULL,
          owner_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
          PRIMARY KEY(id)
        )');
        $this->addSql('CREATE INDEX IDX_8F02BF9D7E3C61F9 ON user_group (owner_id)');
        $this->addSql('ALTER TABLE
          group_invitation
        ADD
          CONSTRAINT FK_26D00010FE54D947 FOREIGN KEY (group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          group_invitation
        ADD
          CONSTRAINT FK_26D00010A7B4A7E3 FOREIGN KEY (invited_by_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          "user"
        ADD
          CONSTRAINT FK_8D93D6491ED93D47 FOREIGN KEY (user_group_id) REFERENCES user_group (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE
          user_group
        ADD
          CONSTRAINT FK_8F02BF9D7E3C61F9 FOREIGN KEY (owner_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE company DROP cognito_id');
        $this->addSql('DROP INDEX uniq_fe44e340979b1ad6');
        $this->addSql('ALTER TABLE company_investment ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE company_investment DROP cognito_id');
        $this->addSql('ALTER TABLE
          company_investment
        ADD
          CONSTRAINT FK_FE44E340A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_FE44E340979B1AD6 ON company_investment (company_id)');
        $this->addSql('CREATE INDEX IDX_FE44E340A76ED395 ON company_investment (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE company_investment DROP CONSTRAINT FK_FE44E340A76ED395');
        $this->addSql('DROP SEQUENCE group_invitation_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE "user_id_seq" CASCADE');
        $this->addSql('DROP SEQUENCE user_group_id_seq CASCADE');
        $this->addSql('ALTER TABLE group_invitation DROP CONSTRAINT FK_26D00010FE54D947');
        $this->addSql('ALTER TABLE group_invitation DROP CONSTRAINT FK_26D00010A7B4A7E3');
        $this->addSql('ALTER TABLE "user" DROP CONSTRAINT FK_8D93D6491ED93D47');
        $this->addSql('ALTER TABLE user_group DROP CONSTRAINT FK_8F02BF9D7E3C61F9');
        $this->addSql('DROP TABLE group_invitation');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('DROP TABLE user_group');
        $this->addSql('DROP INDEX IDX_FE44E340979B1AD6');
        $this->addSql('DROP INDEX IDX_FE44E340A76ED395');
        $this->addSql('ALTER TABLE company_investment ADD cognito_id VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE company_investment DROP user_id');
        $this->addSql('CREATE UNIQUE INDEX uniq_fe44e340979b1ad6 ON company_investment (company_id)');
        $this->addSql('ALTER TABLE company ADD cognito_id TEXT NOT NULL');
    }
}
