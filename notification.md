#### 其他通知格式选项

你可以使用 `view` 方法来指定一个应用于渲染通知电子邮件的自定义模板，而不是在通知类中定义文本的「模板」:

    class User extends Authenticatable
    {
        use Notifiable;

        /**
         * 邮件频道的路由
         *
         * @return string
         */
        public function routeNotificationForMail()
        {
            return $this->email_address;
        }
    }

    
11111
