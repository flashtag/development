## Flashtag

#### dev instructions

 - clone all the flashtag repos to a common parent dir
 
 - composer install
 
 - copy `.env.example` to `.env`
 
 - `php artisan key:generate`

 - `vendor/bin/homestead make`

 - add something like this to the map section of `Homestead.yaml`, except match the directories with yours:

```yaml
folders:
    - map: "~/Code/flashtag/cms"
      to: "/home/vagrant/cms"
    - map: "~/Code/flashtag/core"
      to: "/home/vagrant/core"
    - map: "~/Code/flashtag/api"
      to: "/home/vagrant/api"
    - map: "~/Code/flashtag/admin"
      to: "/home/vagrant/admin"
```

 - `vagrant up`
 
 . . .
 