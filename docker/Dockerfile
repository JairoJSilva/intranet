FROM php:8.2-apache

# Informações
LABEL maintainer="Flowti TIC <tic@flowti.com.br>"
LABEL description="Intranet Flowti — Portal Unificado Corporativo"

# Instala extensões PHP necessárias
RUN apt-get update && apt-get install -y \
    libldap2-dev \
    libcurl4-openssl-dev \
    libonig-dev \
    libzip-dev \
    unzip \
    && docker-php-ext-install \
        pdo_mysql \
        ldap \
        mbstring \
        curl \
        zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Habilita mod_rewrite e mod_headers do Apache
RUN a2enmod rewrite headers

# Configura Apache para apontar para o diretório public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Permite .htaccess (AllowOverride All)
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia código da aplicação
COPY ../aplicação/ /var/www/html/

# Instala dependências PHP via Composer (se houver vendor)
WORKDIR /var/www/html
RUN if [ -f "composer.json" ]; then composer install --no-dev --optimize-autoloader --no-interaction; fi

# Permissões
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expõe porta 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1
