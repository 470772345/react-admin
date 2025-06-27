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
    })
  ),
});

type FormValues = {
  users: { name: string; email: string; gender: boolean; ageGroup: string }[];
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

export default function DynamicForm() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: { users: [{ name: '', email: '', gender: false, ageGroup: '' }] },
    resolver: yupResolver(schema) as any,
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'users' });
  const users = watch('users');

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
      className="p-8 max-w-xl mx-auto bg-white rounded shadow"
      onSubmit={handleSubmit((data) => {
        alert(JSON.stringify(data, null, 2));
      })}
    >
      <h1 className="text-2xl font-bold mb-4">动态用户表单</h1>
      {fields.map((item, index) => {
        const isMale = users?.[index]?.gender;
        const ageOptions = isMale ? ageOptionsMale : ageOptionsFemale;
        return (
          <div key={item.id} className="mb-4 p-4 border rounded bg-gray-50 relative">
            <div className="mb-2">
              <Input
                className="bg-white"
                placeholder="Name"
                {...register(`users.${index}.name` as const)}
              />
              {errors.users?.[index]?.name && (
                <p className="text-red-500 text-xs mt-1">{errors.users[index]?.name?.message}</p>
              )}
            </div>
            <div className="mb-2">
              <Input
                className="bg-white"
                placeholder="Email"
                {...register(`users.${index}.email` as const)}
              />
              {errors.users?.[index]?.email && (
                <p className="text-red-500 text-xs mt-1">{errors.users[index]?.email?.message}</p>
              )}
            </div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm text-gray-700">性别（男/女）</label>
              <Controller
                control={control}
                name={`users.${index}.gender` as const}
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
                name={`users.${index}.ageGroup` as const}
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
              {errors.users?.[index]?.ageGroup && (
                <p className="text-red-500 text-xs mt-1">{errors.users[index]?.ageGroup?.message}</p>
              )}
            </div>
            <Button
              type="button"
              variant="destructive"
              className="absolute top-2 right-2 px-2 py-1"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              删除
            </Button>
          </div>
        );
      })}
      <Button
        type="button"
        variant="secondary"
        className="mb-4 mr-4"
        onClick={() => append({ name: '', email: '', gender: false, ageGroup: '' })}
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