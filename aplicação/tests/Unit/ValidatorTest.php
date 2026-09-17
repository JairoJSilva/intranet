<?php
declare(strict_types=1);

namespace App\Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Helpers\Validator;

final class ValidatorTest extends TestCase
{
    private Validator $validator;

    protected function setUp(): void
    {
        $this->validator = new Validator();
    }

    public function testRequiredFieldsPassWhenPresent(): void
    {
        $data = ['username' => 'admin', 'password' => 'secret'];
        $this->validator->required($data, ['username', 'password']);

        $this->assertTrue($this->validator->passes());
        $this->assertFalse($this->validator->fails());
        $this->assertEmpty($this->validator->getErrors());
    }

    public function testRequiredFieldsFailWhenMissingOrEmpty(): void
    {
        $data = ['username' => '   ', 'password' => 'secret'];
        $this->validator->required($data, ['username', 'missing_field']);

        $this->assertFalse($this->validator->passes());
        $this->assertTrue($this->validator->fails());
        $errors = $this->validator->getErrors();
        $this->assertArrayHasKey('username', $errors);
        $this->assertArrayHasKey('missing_field', $errors);
    }

    public function testEmailValidation(): void
    {
        $dataValid = ['email' => 'colab@flowti.com.br'];
        $this->validator->email($dataValid, 'email');
        $this->assertTrue($this->validator->passes());

        $this->validator->reset();
        $dataInvalid = ['email' => 'invalid-email-address'];
        $this->validator->email($dataInvalid, 'email');
        $this->assertTrue($this->validator->fails());
        $this->assertArrayHasKey('email', $this->validator->getErrors());
    }

    public function testUrlValidation(): void
    {
        $dataValid = ['url' => 'https://flowti.com.br'];
        $this->validator->url($dataValid, 'url');
        $this->assertTrue($this->validator->passes());

        $this->validator->reset();
        $dataInvalid = ['url' => 'not_a_valid_url'];
        $this->validator->url($dataInvalid, 'url');
        $this->assertTrue($this->validator->fails());
    }

    public function testMinAndMaxLength(): void
    {
        $data = ['name' => 'Abc'];
        $this->validator->minLength($data, 'name', 5);
        $this->assertTrue($this->validator->fails());

        $this->validator->reset();
        $this->validator->maxLength($data, 'name', 2);
        $this->assertTrue($this->validator->fails());

        $this->validator->reset();
        $this->validator->minLength($data, 'name', 2);
        $this->validator->maxLength($data, 'name', 10);
        $this->assertTrue($this->validator->passes());
    }

    public function testInListValidation(): void
    {
        $data = ['status' => 'online'];
        $this->validator->inList($data, 'status', ['online', 'offline', 'warning']);
        $this->assertTrue($this->validator->passes());

        $this->validator->reset();
        $dataInvalid = ['status' => 'broken'];
        $this->validator->inList($dataInvalid, 'status', ['online', 'offline']);
        $this->assertTrue($this->validator->fails());
    }
}
