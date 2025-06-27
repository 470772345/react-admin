import { useForm, useFieldArray, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';

// 定义表单校验 schema
const schema = Yup.object().shape({
  users: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      gender: Yup.boolean().required(),
      ageGroup: Yup.string().required('Please select age group'),
      addresses: Yup.array().of(
        Yup.object().shape({
          type: Yup.string().required('请选择地址类型'),
          detail: Yup.string().required('请输入详细地址'),
        })
      ).min(1, '至少填写一个地址'),
    })
  ),
});

type Address = { type: string; detail: string };
type FormValues = {
  users: { name: string; email: string; gender: boolean; ageGroup: string; addresses: Address[] }[];
};

const ageOptionsMale = [
  { value: '20-27', label: '20-27岁' },
  { value: '28-37', label: '28-37岁' },
  { value: '38-47', label: '38-47岁' },
  { value: '48+', label: '48岁及以上' },
];
const ageOptionsFemale = [
  { value: '18-25', label: '18-25岁' },
  { value: '26-35', label: '26-35岁' },
  { value: '36-45', label: '36-45岁' },
  { value: '46+', label: '46岁及以上' },
];
const addressTypeOptions = [
  { value: 'home', label: '家庭' },
  { value: 'work', label: '公司' },
  { value: 'other', label: '其他' },
];

export default function DynamicForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      users: [
        {
          name: '',
          email: '',
          gender: false,
          ageGroup: '',
          addresses: [{ type: '', detail: '' }],
        },
      ],
    },
    resolver: yupResolver(schema) as any,
  });
  const { fields: userFields, append: appendUser, remove: removeUser } = useFieldArray({ control, name: 'users' });
  const users = watch('users');

  // 修复：所有 addresses useFieldArray 必须在顶层调用
  const addressesFieldArrays = userFields.map((_, userIndex) =>
    useFieldArray({
      control,
      name: `users.${userIndex}.addresses` as const,
    })
  );

  // 联动清空不合法的年龄段（用 useEffect 代替 render 里的 setValue）
  useEffect(() => {
    users.forEach((user, index) => {
      const isMale = user.gender;
      const ageOptions = isMale ? ageOptionsMale : ageOptionsFemale;
      if (user.ageGroup && !ageOptions.some(opt => opt.value === user.ageGroup)) {
        setValue(`users.${index}.ageGroup`, '');
      }
    });
  }, [users, setValue]);

  return (
    <form
      className="p-8 max-w-2xl mx-auto bg-white rounded shadow"
      onSubmit={handleSubmit((data) => {
        alert(JSON.stringify(data, null, 2));
      })}
    >
      <h1 className="text-2xl font-bold mb-4">动态用户表单（嵌套地址）</h1>
      {userFields.map((user, userIndex) => {
        const isMale = users?.[userIndex]?.gender;
        const ageOptions = isMale ? ageOptionsMale : ageOptionsFemale;
        // 取用顶层声明的 addressesFieldArrays
        const { fields: addressFields, append: appendAddress, remove: removeAddress } = addressesFieldArrays[userIndex];
        return (
          <div key={user.id} className="mb-8 p-4 border rounded bg-gray-50 relative">
            <div className="mb-2">
              <Input
                className="bg-white"
                placeholder="Name"
                {...register(`users.${userIndex}.name` as const)}
              />
              {errors.users?.[userIndex]?.name && (
                <p className="text-red-500 text-xs mt-1">{errors.users[userIndex]?.name?.message}</p>
              )}
            </div>
            <div className="mb-2">
              <Input
                className="bg-white"
                placeholder="Email"
                {...register(`users.${userIndex}.email` as const)}
              />
              {errors.users?.[userIndex]?.email && (
                <p className="text-red-500 text-xs mt-1">{errors.users[userIndex]?.email?.message}</p>
              )}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm text-gray-700">性别（男/女）</label>
              <Controller
                control={control}
                name={`users.${userIndex}.gender` as const}
                render={({ field }) => (
                  <>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <span className="text-xs text-gray-500 ml-2">{field.value ? '男' : '女'}</span>
                  </>
                )}
              />
            </div>
            <div className="mb-2">
              <Controller
                control={control}
                name={`users.${userIndex}.ageGroup` as const}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="请选择年龄段" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.users?.[userIndex]?.ageGroup && (
                <p className="text-red-500 text-xs mt-1">{errors.users[userIndex]?.ageGroup?.message}</p>
              )}
            </div>
            {/* 嵌套地址列表 */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">地址列表</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => appendAddress({ type: '', detail: '' })}
                >
                  添加地址
                </Button>
              </div>
              {addressFields.map((addr, addrIndex) => (
                <div key={addr.id} className="flex gap-2 mb-2 items-center">
                  <Controller
                    control={control}
                    name={`users.${userIndex}.addresses.${addrIndex}.type` as const}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-28 bg-white">
                          <SelectValue placeholder="类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {addressTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    className="bg-white flex-1"
                    placeholder="详细地址"
                    {...register(`users.${userIndex}.addresses.${addrIndex}.detail` as const)}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeAddress(addrIndex)}
                    disabled={addressFields.length === 1}
                  >
                    删除
                  </Button>
                </div>
              ))}
              {errors.users?.[userIndex]?.addresses && typeof errors.users[userIndex]?.addresses?.message === 'string' && (
                <p className="text-red-500 text-xs mt-1">{errors.users[userIndex]?.addresses?.message}</p>
              )}
              {/* 地址项的字段错误提示 */}
              {addressFields.map((addr, addrIndex) => (
                <div key={addr.id + '-err'}>
                  {errors.users?.[userIndex]?.addresses?.[addrIndex]?.type && (
                    <p className="text-red-500 text-xs mt-1">{errors.users[userIndex]?.addresses?.[addrIndex]?.type?.message}</p>
                  )}
                  {errors.users?.[userIndex]?.addresses?.[addrIndex]?.detail && (
                    <p className="text-red-500 text-xs mt-1">{errors.users[userIndex]?.addresses?.[addrIndex]?.detail?.message}</p>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="destructive"
              className="absolute top-2 right-2 px-2 py-1"
              onClick={() => removeUser(userIndex)}
              disabled={userFields.length === 1}
            >
              删除用户
            </Button>
          </div>
        );
      })}
      <Button
        type="button"
        variant="secondary"
        className="mb-4 mr-4"
        onClick={() => appendUser({ name: '', email: '', gender: false, ageGroup: '', addresses: [{ type: '', detail: '' }] })}
      >
        添加用户
      </Button>
      <Button
        type="submit"
        variant="default"
        className="ml-0"
      >
        提交
      </Button>
    </form>
  );
} 